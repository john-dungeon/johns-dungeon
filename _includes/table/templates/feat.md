{%- capture ft_category %}{% include table/field.html packed=include.packed key="category" %}{% endcapture -%}
{%- capture ft_prerequisite %}{% include table/field.html packed=include.packed key="prerequisite" %}{% endcapture -%}
{%- capture ft_description %}{% include table/field.html packed=include.packed key="description" %}{% endcapture -%}

{%- assign ft_line = ft_category | append: " Feat" -%}
{%- if ft_prerequisite != "" -%}{%- assign ft_line = ft_line | append: " (Prerequisite: " | append: ft_prerequisite | append: ")" -%}{%- endif -%}
{{ ft_line }}
{: .italic }

{{ ft_description }}
