{%- capture sps_nl %}
{% endcapture -%}
{%- capture sps_name %}{% include table/field.html packed=include.packed key="name" %}{% endcapture -%}
{%- capture sps_article %}{% include table/field.html packed=include.packed key="article" %}{% endcapture -%}
{%- capture sps_description %}{% include table/field.html packed=include.packed key="description" %}{% endcapture -%}
{%- capture sps_age %}{% include table/field.html packed=include.packed key="age" %}{% endcapture -%}
{%- capture sps_type %}{% include table/field.html packed=include.packed key="type" %}{% endcapture -%}
{%- capture sps_size %}{% include table/field.html packed=include.packed key="size" %}{% endcapture -%}
{%- capture sps_speed %}{% include table/field.html packed=include.packed key="speed" %}{% endcapture -%}
{%- capture sps_traits %}{% include table/field.html packed=include.packed key="traits" %}{% endcapture -%}

{%- if sps_article == "" -%}
  {%- assign sps_first = sps_name | slice: 0 | downcase -%}
  {%- if "aeiou" contains sps_first -%}{%- assign sps_article = "an" -%}{%- else -%}{%- assign sps_article = "a" -%}{%- endif -%}
{%- endif -%}

{%- assign sps_break = "\" | append: sps_nl -%}
{%- assign sps_block = "" -%}
{%- if sps_age != "" -%}
  {%- assign sps_block = sps_block | append: sps_break | append: "**Age:** " | append: sps_age -%}
{%- endif -%}
{%- if sps_type != "" -%}
  {%- capture sps_type_csv %}{% include table/list.html csv=sps_type sep="," %}{% endcapture -%}
  {%- assign sps_type_count = sps_type_csv | split: "," | size -%}
  {%- capture sps_type_text %}{% include table/join-words.html items=sps_type word="and" %}{% endcapture -%}
  {%- if sps_type_count > 1 -%}
    {%- assign sps_type_text = sps_type_text | append: "; you can be affected by an effect if it works on either of your creature types" -%}
  {%- endif -%}
  {%- assign sps_block = sps_block | append: sps_break | append: "**Creature Type:** " | append: sps_type_text -%}
{%- endif -%}
{%- if sps_size != "" -%}
  {%- capture sps_size_csv %}{% include table/list.html csv=sps_size sep="," %}{% endcapture -%}
  {%- assign sps_size_count = sps_size_csv | split: "," | size -%}
  {%- capture sps_size_text %}{% include table/join-words.html items=sps_size word="or" %}{% endcapture -%}
  {%- if sps_size_count > 1 -%}
    {%- assign sps_size_text = sps_size_text | append: ", chosen when you select this species" -%}
  {%- endif -%}
  {%- assign sps_block = sps_block | append: sps_break | append: "**Size:** " | append: sps_size_text -%}
{%- endif -%}
{%- if sps_speed != "" -%}
  {%- assign sps_block = sps_block | append: sps_break | append: "**Speed:** " | append: sps_speed -%}
{%- endif -%}
{%- assign sps_block = sps_block | remove_first: sps_break -%}

{%- capture sps_traits_md -%}
  {%- assign sps_tlines = sps_traits | append: sps_nl | append: "- end: end" | split: sps_nl -%}
  {%- assign sps_tname = "" -%}
  {%- assign sps_tdesc = "" -%}
  {%- assign sps_in_desc = false -%}
  {%- for sps_tline in sps_tlines -%}
    {%- assign sps_head = sps_tline | slice: 0, 2 -%}
    {%- assign sps_probe = sps_tline | strip | append: " " -%}
    {%- assign sps_tkey = sps_probe | split: ": " | first -%}
    {%- if sps_head == "- " -%}
      {%- if sps_tname != "" -%}***{{ sps_tname }}.*** {{ sps_tdesc | strip }}{{ sps_nl }}{{ sps_nl }}{%- endif -%}
      {%- assign sps_rest = sps_tline | remove_first: "- " | append: " " -%}
      {%- assign sps_rest_key = sps_rest | split: ": " | first -%}
      {%- if sps_rest contains ": " -%}
        {%- assign sps_tname = sps_rest | remove_first: sps_rest_key | remove_first: ": " | strip -%}
      {%- else -%}
        {%- assign sps_tname = sps_rest | strip -%}
      {%- endif -%}
      {%- assign sps_tdesc = "" -%}
      {%- assign sps_in_desc = false -%}
    {%- elsif sps_tkey == "description" and sps_in_desc == false -%}
      {%- assign sps_tdesc = sps_probe | remove_first: "description" | remove_first: ": " | strip -%}
      {%- assign sps_in_desc = true -%}
    {%- elsif sps_in_desc -%}
      {%- assign sps_indent = sps_tline | slice: 0, 2 -%}
      {%- if sps_indent == "  " -%}
        {%- assign sps_clean = sps_tline | slice: 2, 10000 -%}
      {%- else -%}
        {%- assign sps_clean = sps_tline -%}
      {%- endif -%}
      {%- assign sps_tdesc = sps_tdesc | append: sps_nl | append: sps_clean -%}
    {%- endif -%}
  {%- endfor -%}
{%- endcapture -%}
{{ sps_description }}

### {{ sps_name }} Traits
{{ sps_block }}

As {{ sps_article }} {{ sps_name }}, you have these special traits.

{{ sps_traits_md | strip }}
