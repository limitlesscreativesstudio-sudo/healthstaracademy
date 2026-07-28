ALTER TABLE public.module_items DROP CONSTRAINT IF EXISTS module_items_item_type_check;
ALTER TABLE public.module_items ADD CONSTRAINT module_items_item_type_check
  CHECK (item_type IN ('page','file','link','video','assignment','quiz','discussion','header','external_tool'));