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
  {%- capture sps_type_text %}{% include table/join-words.html items=sps_type word="and" note="; you can be affected by an effect if it works on either of your creature types" %}{% endcapture -%}
  {%- assign sps_block = sps_block | append: sps_break | append: "**Creature Type:** " | append: sps_type_text -%}
{%- endif -%}
{%- if sps_size != "" -%}
  {%- capture sps_size_text %}{% include table/join-words.html items=sps_size word="or" note=", chosen when you select this species" %}{% endcapture -%}
  {%- assign sps_block = sps_block | append: sps_break | append: "**Size:** " | append: sps_size_text -%}
{%- endif -%}
{%- if sps_speed != "" -%}
  {%- assign sps_block = sps_block | append: sps_break | append: "**Speed:** " | append: sps_speed -%}
{%- endif -%}
{%- assign sps_block = sps_block | remove_first: sps_break -%}

{{ sps_description }}

### {{ sps_name }} Traits
{{ sps_block }}

As {{ sps_article }} {{ sps_name }}, you have these special traits.

{% include table/named-list.html text=sps_traits %}
