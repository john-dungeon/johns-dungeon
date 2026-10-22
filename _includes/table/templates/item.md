{%- capture it_prefix_type %}{% include table/field.html packed=include.packed key="prefix_type" %}{% endcapture -%}
{%- capture it_type %}{% include table/field.html packed=include.packed key="type" %}{% endcapture -%}
{%- capture it_note_type %}{% include table/field.html packed=include.packed key="note_type" %}{% endcapture -%}
{%- capture it_rarity %}{% include table/field.html packed=include.packed key="rarity" %}{% endcapture -%}
{%- capture it_note_rarity %}{% include table/field.html packed=include.packed key="note_rarity" %}{% endcapture -%}
{%- capture it_attunement %}{% include table/field.html packed=include.packed key="attunement" %}{% endcapture -%}
{%- capture it_note_cost %}{% include table/field.html packed=include.packed key="note_cost" %}{% endcapture -%}
{%- capture it_note_weight %}{% include table/field.html packed=include.packed key="note_weight" %}{% endcapture -%}
{%- capture it_description %}{% include table/field.html packed=include.packed key="description" %}{% endcapture -%}
{%- capture it_setting %}{% include table/field.html packed=include.packed key="setting" %}{% endcapture -%}
{%- capture it_note_setting %}{% include table/field.html packed=include.packed key="note_setting" %}{% endcapture -%}

{%- assign it_line1 = it_prefix_type | append: " " | append: it_type | strip -%}
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

{%- assign it_cost_col = cols | where: "key", "cost" | first -%}
{%- assign it_weight_col = cols | where: "key", "weight" | first -%}
{%- capture it_cost_value %}{% include table/value.html packed=include.packed col=it_cost_col %}{% endcapture -%}
{%- capture it_cost_text %}{% include table/format.html col=it_cost_col amount=it_cost_value %}{% endcapture -%}
{%- capture it_weight_value %}{% include table/value.html packed=include.packed col=it_weight_col %}{% endcapture -%}
{%- capture it_weight_text %}{% include table/format.html col=it_weight_col amount=it_weight_value %}{% endcapture -%}
{%- assign it_cost_text = it_cost_text | strip -%}
{%- assign it_weight_text = it_weight_text | strip -%}
{%- assign it_cost_l = it_cost_text | downcase -%}
{%- assign it_weight_l = it_weight_text | downcase -%}
{%- if it_cost_l == "varies" -%}{%- assign it_cost_text = it_cost_col.label | append: " Varies" -%}{%- endif -%}
{%- if it_weight_l == "varies" -%}{%- assign it_weight_text = it_weight_col.label | append: " Varies" -%}{%- endif -%}
{%- if it_cost_text != "" and it_note_cost != "" -%}{%- assign it_cost_text = it_cost_text | append: " (" | append: it_note_cost | append: ")" -%}{%- endif -%}
{%- if it_weight_text != "" and it_note_weight != "" -%}{%- assign it_weight_text = it_weight_text | append: " (" | append: it_note_weight | append: ")" -%}{%- endif -%}

{%- assign it_line2 = it_cost_text -%}
{%- if it_cost_text != "" and it_weight_text != "" -%}{%- assign it_line2 = it_line2 | append: ", " -%}{%- endif -%}
{%- assign it_line2 = it_line2 | append: it_weight_text -%}
{%- assign it_setting_line = "" -%}
{%- capture it_setting_csv %}{% include table/list.html csv=it_setting sep="," %}{% endcapture -%}
{%- if it_setting_csv != "" -%}
  {%- capture it_setting_text %}{% include table/join-words.html items=it_setting_csv word="and" %}{% endcapture -%}
  {%- assign it_setting_count = it_setting_csv | split: "," | size -%}
  {%- if it_setting_count == 1 -%}
    {%- assign it_setting_line = "This item can only be found in the " | append: it_setting_text | append: " setting." -%}
  {%- else -%}
    {%- assign it_setting_line = "This item can only be found in the following settings: " | append: it_setting_text | append: "." -%}
  {%- endif -%}
  {%- if it_note_setting != "" -%}{%- assign it_setting_line = it_setting_line | append: " " | append: it_note_setting -%}{%- endif -%}
{%- endif -%}
{{ it_line1 }}
{%- if it_line2 != "" %}\
{{ it_line2 }}
{%- endif %}
{: .italic }

{{ it_description }}
{%- if it_setting_line != "" %}

> ***Setting-Specific.*** {{ it_setting_line }}
{: .italic }
{%- endif %}
