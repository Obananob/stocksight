-- Function: convert_to_sales_rep
-- Called by an owner after creating a new user via signUp
-- Updates the auto-assigned 'owner' role to 'sales_rep' under the calling owner
CREATE OR REPLACE FUNCTION public.convert_to_sales_rep(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is an owner
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only owners can add sales reps';
  END IF;

  -- Update the auto-created 'owner' role to 'sales_rep'
  UPDATE public.user_roles
  SET role = 'sales_rep', owner_id = auth.uid()
  WHERE user_id = _user_id;

  -- If no row was updated, insert one
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role, owner_id)
    VALUES (_user_id, 'sales_rep', auth.uid());
  END IF;
END;
$$;

-- Allow owners to see profiles of their sales reps
CREATE POLICY "Owners can view sales rep profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT ur.user_id FROM public.user_roles ur
      WHERE ur.owner_id = auth.uid() AND ur.role = 'sales_rep'
    )
    OR id = auth.uid()
  );

-- Allow owners to see user_roles they own
CREATE POLICY "Owners can view their team roles"
  ON public.user_roles FOR SELECT
  USING (owner_id = auth.uid() OR user_id = auth.uid());

-- Allow owners to delete sales rep roles (to remove team members)
CREATE POLICY "Owners can remove sales rep roles"
  ON public.user_roles FOR DELETE
  USING (
    owner_id = auth.uid()
    AND role = 'sales_rep'
    AND public.has_role(auth.uid(), 'owner')
  );
