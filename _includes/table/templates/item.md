{%- capture it_type %}{% include table/field.html packed=include.packed key="type" %}{% endcapture -%}
{%- capture it_note_type %}{% include table/field.html packed=include.packed key="note_type" %}{% endcapture -%}
{%- capture it_rarity %}{% include table/field.html packed=include.packed key="rarity" %}{% endcapture -%}
{%- capture it_note_rarity %}{% include table/field.html packed=include.packed key="note_rarity" %}{% endcapture -%}
{%- capture it_attunement %}{% include table/field.html packed=include.packed key="attunement" %}{% endcapture -%}
{%- capture it_cost %}{% include table/field.html packed=include.packed key="cost" %}{% endcapture -%}
{%- capture it_note_cost %}{% include table/field.html packed=include.packed key="note_cost" %}{% endcapture -%}
{%- capture it_weight %}{% include table/field.html packed=include.packed key="weight" %}{% endcapture -%}
{%- capture it_note_weight %}{% include table/field.html packed=include.packed key="note_weight" %}{% endcapture -%}
{%- capture it_description %}{% include table/field.html packed=include.packed key="description" %}{% endcapture -%}

{%- assign it_line1 = it_type -%}
{%- if it_note_type != "" -%}{%- assign it_line1 = it_line1 | append: " (" | append: it_note_type | append: ")" -%}{%- endif -%}
{%- assign it_rarity_l = it_rarity | downcase -%}
{%- if it_rarity != "" and it_rarity_l != "none" -%}
  {%- if it_rarity_l == "varies" -%}
    {%- assign it_line1 = it_line1 | append: ", Rarity Varies" -%}
  {%- else -%}
    {%- assign it_line1 = it_line1 | append: ", " | append: it_rarity -%}
  {%- endif -%}
  {%- assign it_extra = "" -%}
  {%- assign it_attunement_l = it_attunement | downcase -%}
  {%- if it_attunement_l == "true" -%}{%- assign it_extra = "Requires Attunement" -%}{%- endif -%}
  {%- if it_note_rarity != "" -%}{%- assign it_extra = it_extra | append: " " | append: it_note_rarity | strip -%}{%- endif -%}
  {%- if it_extra != "" -%}{%- assign it_line1 = it_line1 | append: " (" | append: it_extra | append: ")" -%}{%- endif -%}
{%- endif -%}

{%- assign it_cost_text = "" -%}
{%- assign it_cost_l = it_cost | downcase -%}
{%- if it_cost_l == "varies" -%}
  {%- assign it_cost_text = "Cost Varies" -%}
{%- elsif it_cost != "" -%}
  {%- assign it_cost_num = it_cost | plus: 0 | append: "" -%}
  {%- if it_cost_num == it_cost -%}{%- assign it_cost_text = it_cost | append: " GP" -%}{%- else -%}{%- assign it_cost_text = it_cost -%}{%- endif -%}
{%- endif -%}
{%- if it_cost_text != "" and it_note_cost != "" -%}{%- assign it_cost_text = it_cost_text | append: " (" | append: it_note_cost | append: ")" -%}{%- endif -%}

{%- assign it_weight_text = "" -%}
{%- assign it_weight_l = it_weight | downcase -%}
{%- if it_weight_l == "varies" -%}
  {%- assign it_weight_text = "Weight Varies" -%}
{%- elsif it_weight != "" -%}
  {%- assign it_weight_text = it_weight | append: " lb." -%}
{%- endif -%}
{%- if it_weight_text != "" and it_note_weight != "" -%}{%- assign it_weight_text = it_weight_text | append: " (" | append: it_note_weight | append: ")" -%}{%- endif -%}

{%- assign it_line2 = it_cost_text -%}
{%- if it_cost_text != "" and it_weight_text != "" -%}{%- assign it_line2 = it_line2 | append: ", " -%}{%- endif -%}
{%- assign it_line2 = it_line2 | append: it_weight_text -%}
*{{ it_line1 }}*
{%- if it_line2 != "" %}\
*{{ it_line2 }}*
{%- endif %}

{{ it_description }}
