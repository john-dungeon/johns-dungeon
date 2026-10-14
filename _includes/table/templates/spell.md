{%- capture sp_level %}{% include table/field.html packed=include.packed key="level" %}{% endcapture -%}
{%- capture sp_school %}{% include table/field.html packed=include.packed key="school" %}{% endcapture -%}
{%- capture sp_classes %}{% include table/field.html packed=include.packed key="classes" %}{% endcapture -%}
{%- capture sp_casting_time %}{% include table/field.html packed=include.packed key="casting_time" %}{% endcapture -%}
{%- capture sp_condition %}{% include table/field.html packed=include.packed key="condition" %}{% endcapture -%}
{%- capture sp_ritual %}{% include table/field.html packed=include.packed key="ritual" %}{% endcapture -%}
{%- capture sp_range %}{% include table/field.html packed=include.packed key="range" %}{% endcapture -%}
{%- capture sp_area %}{% include table/field.html packed=include.packed key="area" %}{% endcapture -%}
{%- capture sp_components %}{% include table/field.html packed=include.packed key="components" %}{% endcapture -%}
{%- capture sp_material %}{% include table/field.html packed=include.packed key="material" %}{% endcapture -%}
{%- capture sp_duration %}{% include table/field.html packed=include.packed key="duration" %}{% endcapture -%}
{%- capture sp_concentration_max %}{% include table/field.html packed=include.packed key="concentration_max" %}{% endcapture -%}
{%- capture sp_description %}{% include table/field.html packed=include.packed key="description" %}{% endcapture -%}

{%- capture sp_classes_text %}{% include table/list.html csv=sp_classes sep=", " %}{% endcapture -%}
{%- assign sp_level_l = sp_level | downcase -%}
{%- if sp_level_l == "cantrip" -%}
  {%- assign sp_header = sp_school | append: " Cantrip (" | append: sp_classes_text | append: ")" -%}
{%- else -%}
  {%- assign sp_header = "Level " | append: sp_level | append: " " | append: sp_school | append: " (" | append: sp_classes_text | append: ")" -%}
{%- endif -%}

{%- assign sp_cast = sp_casting_time -%}
{%- assign sp_ritual_l = sp_ritual | downcase -%}
{%- if sp_ritual_l == "true" -%}{%- assign sp_cast = sp_cast | append: " or Ritual" -%}{%- endif -%}
{%- assign sp_cast = sp_cast | append: sp_condition -%}

{%- assign sp_range_text = sp_range -%}
{%- if sp_area != "" -%}
  {%- assign sp_range_text = sp_range | append: " (" | append: sp_area | append: ")" -%}
{%- endif -%}

{%- assign sp_comp_up = sp_components | upcase -%}
{%- assign sp_parts = "" -%}
{%- if sp_comp_up contains "V" -%}{%- assign sp_parts = sp_parts | append: "V " -%}{%- endif -%}
{%- if sp_comp_up contains "S" -%}{%- assign sp_parts = sp_parts | append: "S " -%}{%- endif -%}
{%- if sp_comp_up contains "M" -%}{%- assign sp_parts = sp_parts | append: "M " -%}{%- endif -%}
{%- assign sp_comp_text = sp_parts | strip | split: " " | join: ", " -%}
{%- if sp_comp_up contains "M" and sp_material != "" -%}
  {%- assign sp_comp_text = sp_comp_text | append: " (" | append: sp_material | append: ")" -%}
{%- endif -%}

{%- assign sp_duration_text = sp_duration -%}
{%- assign sp_duration_l = sp_duration | downcase -%}
{%- if sp_duration_l == "concentration" and sp_concentration_max != "" -%}
  {%- assign sp_duration_text = sp_duration | append: ", up to " | append: sp_concentration_max -%}
{%- endif -%}
*{{ sp_header }}*

**Casting Time:** {{ sp_cast }}\
**Range:** {{ sp_range_text }}\
**Components:** {{ sp_comp_text }}\
**Duration:** {{ sp_duration_text }}

{{ sp_description }}
