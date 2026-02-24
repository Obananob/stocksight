-- Allow owners to delete roles for their team members
CREATE POLICY "Owners can delete team roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) AND owner_id = auth.uid());