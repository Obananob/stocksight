-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('owner', 'sales_rep');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create inventory_logs table (immutable, append-only)
CREATE TABLE public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('add', 'sale', 'adjustment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reconciliation table
CREATE TABLE public.reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  expected_cash DECIMAL(10,2) NOT NULL,
  cash_received DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'disputed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's owner_id
CREATE OR REPLACE FUNCTION public.get_user_owner_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT owner_id FROM public.user_roles WHERE user_id = _user_id AND role = 'sales_rep'),
    (SELECT user_id FROM public.user_roles WHERE user_id = _user_id AND role = 'owner')
  )
$$;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Roles RLS Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can view their team roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'owner') AND (owner_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "Owners can insert roles for their team"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'owner') AND owner_id = auth.uid());

-- Products RLS Policies
CREATE POLICY "Users can view products in their organization"
  ON public.products FOR SELECT
  USING (owner_id = public.get_user_owner_id(auth.uid()));

CREATE POLICY "Owners can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'owner') AND owner_id = auth.uid());

CREATE POLICY "Owners can update their products"
  ON public.products FOR UPDATE
  USING (public.has_role(auth.uid(), 'owner') AND owner_id = auth.uid());

CREATE POLICY "Owners can delete their products"
  ON public.products FOR DELETE
  USING (public.has_role(auth.uid(), 'owner') AND owner_id = auth.uid());

-- Inventory Logs RLS Policies (read-only for all users in organization)
CREATE POLICY "Users can view inventory logs in their organization"
  ON public.inventory_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = inventory_logs.product_id
    AND products.owner_id = public.get_user_owner_id(auth.uid())
  ));

CREATE POLICY "Users can insert inventory logs"
  ON public.inventory_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = inventory_logs.product_id
    AND products.owner_id = public.get_user_owner_id(auth.uid())
  ));

-- Sales RLS Policies
CREATE POLICY "Users can view sales in their organization"
  ON public.sales FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = sales.product_id
    AND products.owner_id = public.get_user_owner_id(auth.uid())
  ));

CREATE POLICY "Users can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = sales.product_id
    AND products.owner_id = public.get_user_owner_id(auth.uid())
  ) AND user_id = auth.uid());

-- Reconciliation RLS Policies
CREATE POLICY "Owners can view their reconciliation records"
  ON public.reconciliation FOR SELECT
  USING (public.has_role(auth.uid(), 'owner') AND owner_id = auth.uid());

CREATE POLICY "Owners can insert reconciliation records"
  ON public.reconciliation FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'owner') AND owner_id = auth.uid());

CREATE POLICY "Owners can update their reconciliation records"
  ON public.reconciliation FOR UPDATE
  USING (public.has_role(auth.uid(), 'owner') AND owner_id = auth.uid());

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reconciliation_updated_at
  BEFORE UPDATE ON public.reconciliation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.phone
  );
  
  -- Insert role (default to owner for new signups)
  INSERT INTO public.user_roles (user_id, role, owner_id)
  VALUES (NEW.id, 'owner', NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_logs;