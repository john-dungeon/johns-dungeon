{%- capture ms_nl %}
{% endcapture -%}
{%- capture ms_name %}{% include table/field.html packed=include.packed key="name" %}{% endcapture -%}
{%- capture ms_size %}{% include table/field.html packed=include.packed key="size" %}{% endcapture -%}
{%- capture ms_type %}{% include table/field.html packed=include.packed key="type" %}{% endcapture -%}
{%- capture ms_alignment %}{% include table/field.html packed=include.packed key="alignment" %}{% endcapture -%}
{%- capture ms_ac %}{% include table/field.html packed=include.packed key="ac" %}{% endcapture -%}
{%- capture ms_initiative %}{% include table/field.html packed=include.packed key="initiative" %}{% endcapture -%}
{%- capture ms_hp %}{% include table/field.html packed=include.packed key="hp" %}{% endcapture -%}
{%- capture ms_speed %}{% include table/field.html packed=include.packed key="speed" %}{% endcapture -%}
{%- capture ms_saves %}{% include table/field.html packed=include.packed key="saves" %}{% endcapture -%}
{%- capture ms_cr %}{% include table/field.html packed=include.packed key="cr" %}{% endcapture -%}
{%- capture ms_flavor %}{% include table/field.html packed=include.packed key="flavor" %}{% endcapture -%}

{%- assign ms_challenge = site.data.challenge | where: "cr", ms_cr | first -%}
{%- assign ms_pb = ms_challenge.pb -%}

{%- assign ms_abilities = "str,dex,con,int,wis,cha" | split: "," -%}
{%- assign ms_saves_up = ms_saves | upcase -%}
{%- assign ms_table = "" -%}
{%- for ms_ab in ms_abilities -%}
  {%- capture ms_score %}{% include table/field.html packed=include.packed key=ms_ab %}{% endcapture -%}
  {%- assign ms_mod = ms_score | minus: 10 | divided_by: 2 -%}
  {%- assign ms_ab_up = ms_ab | upcase -%}
  {%- assign ms_save = ms_mod -%}
  {%- if ms_saves_up contains ms_ab_up -%}{%- assign ms_save = ms_mod | plus: ms_pb -%}{%- endif -%}
  {%- if ms_ab == "dex" -%}{%- assign ms_dex_mod = ms_mod -%}{%- endif -%}
  {%- capture ms_cells %}| {{ ms_ab_up }} | {{ ms_score }} | {% include table/signed.html amount=ms_mod %} | {% include table/signed.html amount=ms_save %} {% endcapture -%}
  {%- assign ms_table = ms_table | append: ms_cells -%}
  {%- assign ms_pos = forloop.index | modulo: 3 -%}
  {%- if ms_pos == 0 -%}{%- assign ms_table = ms_table | append: "|" | append: ms_nl -%}{%- endif -%}
{%- endfor -%}

{%- if ms_initiative == "" -%}
  {%- capture ms_initiative %}{% include table/signed.html amount=ms_dex_mod %} ({{ ms_dex_mod | plus: 10 }}){% endcapture -%}
{%- endif -%}

{%- capture ms_size_text %}{% include table/join-words.html items=ms_size word="or" %}{% endcapture -%}
{%- capture ms_type_text %}{% include table/join-words.html items=ms_type word="and" %}{% endcapture -%}
{%- assign ms_summary = ms_size_text | append: " " | append: ms_type_text -%}
{%- if ms_alignment != "" -%}{%- assign ms_summary = ms_summary | append: ", " | append: ms_alignment -%}{%- endif -%}

{%- assign ms_break = "<br>" | append: ms_nl -%}
{%- assign ms_prop_defs = "skills|Skills,resistances|Resistances,vulnerabilities|Vulnerabilities,immunities|Immunities,gear|Gear,senses|Senses,languages|Languages" | split: "," -%}
{%- assign ms_props = "" -%}
{%- for ms_def in ms_prop_defs -%}
  {%- assign ms_pair = ms_def | split: "|" -%}
  {%- assign ms_key = ms_pair[0] -%}
  {%- capture ms_val %}{% include table/field.html packed=include.packed key=ms_key %}{% endcapture -%}
  {%- if ms_val != "" -%}
    {%- assign ms_props = ms_props | append: ms_break | append: "**" | append: ms_pair[1] | append: "** " | append: ms_val -%}
  {%- endif -%}
{%- endfor -%}
{%- if ms_cr != "" -%}
  {%- capture ms_cr_text %}{% include table/cr.html amount=ms_cr %}{% endcapture -%}
  {%- capture ms_pb_text %}{% include table/signed.html amount=ms_pb %}{% endcapture -%}
  {%- assign ms_props = ms_props | append: ms_break | append: "**CR** " | append: ms_cr_text | append: " (XP " | append: ms_challenge.xp | append: "; PB " | append: ms_pb_text | append: ")" -%}
{%- endif -%}
{%- assign ms_props = ms_props | remove_first: ms_break -%}

{%- assign ms_section_defs = "traits|Traits,actions|Actions,bonus_actions|Bonus Actions,reactions|Reactions,legendary_actions|Legendary Actions" | split: "," -%}
{%- capture ms_sections -%}
  {%- for ms_def in ms_section_defs -%}
    {%- assign ms_pair = ms_def | split: "|" -%}
    {%- assign ms_key = ms_pair[0] -%}
    {%- capture ms_list %}{% include table/field.html packed=include.packed key=ms_key %}{% endcapture -%}
    {%- if ms_list == "" -%}{%- continue -%}{%- endif -%}
    {%- assign ms_intro_key = ms_key | append: "_intro" -%}
    {%- capture ms_intro %}{% include table/field.html packed=include.packed key=ms_intro_key %}{% endcapture -%}
    {{- "<div class='statblock-section' markdown='1'>" | append: ms_nl | append: ms_nl -}}
    {{- "<h3 class='statblock-heading'>" | append: ms_pair[1] | append: "</h3>" | append: ms_nl | append: ms_nl -}}
    {%- if ms_intro != "" -%}{{- ms_intro | append: ms_nl | append: ms_nl -}}{%- endif -%}
    {%- include table/named-list.html text=ms_list row="statblock-row" -%}
    {{- "</div>" | append: ms_nl | append: ms_nl -}}
  {%- endfor -%}
{%- endcapture -%}

{%- assign ms_flavor_md = "" -%}
{%- if ms_flavor != "" -%}{%- assign ms_flavor_md = "> *" | append: ms_flavor | append: "*" -%}{%- endif -%}
<div class="statblock" markdown="1">

<h3 class="statblock-name">{{ ms_name | escape }}</h3>

*{{ ms_summary }}*
{: .statblock-type }

**AC** {{ ms_ac }}<span class="statblock-gap"></span>**Initiative** {{ ms_initiative }}<br>
**HP** {{ ms_hp }}<br>
**Speed** {{ ms_speed }}

| | | MOD | SAVE | | | MOD | SAVE | | | MOD | SAVE |
|---|---|---|---|---|---|---|---|---|---|---|---|
{{ ms_table }}{: .statblock-abilities }

{{ ms_props }}

{{ ms_sections }}{{ ms_flavor_md }}

</div>
