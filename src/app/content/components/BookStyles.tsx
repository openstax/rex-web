// tslint:disable:variable-name
// import bookStyles from 'cnx-recipes/styles/output/intro-business.json';
import { ReactElement } from 'react';
import styled from 'styled-components';

const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

export default styled(Hoc)`

h1,
h2,
h3,
h4,
h5,
h6 {
color:#333
}
p {
margin:1rem 0 0;
color:#555
}
p>[data-type="title"],
p>.title {
display:block;
font-weight:700
}
a:not([role=button]) {
text-decoration:underline
}
img {
max-width:100%;
padding-top:1em;
padding-bottom:1em
}
pre {
text-align:left
}
section:first-child,
figure:first-child,
p:first-child,
.abstract:first-child,
table:first-child {
margin-top:0!important
}
section>section,
section>figure {
margin-top:3rem
}
figure,
:not(figure)>figure {
counter-increment:figure;
counter-reset:subfigure
}
figure {
position:relative;
color:#555;
text-align:center
}
figure>figcaption {
padding:1rem;
font-size:1.3rem
}
figure img {
max-width:100%;
padding:0
}
figure>[data-type="media"],
figure>.media {
display:block;
margin:0;
text-align:center
}
figure>figure {
counter-increment:subfigure
}
figure>figure:not(.ui-has-child-figcaption)::after {
position:relative;
display:block;
text-align:center;
font-weight:700
}
figure:not([data-orient="vertical"]) {
position:relative;
display:table;
top:0;
table-layout:fixed
}
figure:not([data-orient="vertical"])>[data-type="title"],
figure:not([data-orient="vertical"])>.title {
font-weight:700
}
figure:not([data-orient="vertical"])>figcaption {
display:table-caption;
caption-side:bottom;
margin-bottom:1.5rem
}
figure:not([data-orient="vertical"])>figure {
display:table-cell
}
figure:not([data-orient="vertical"])>figure>figcaption {
display:block
}
[data-type="term"],
.term {
font-weight:700
}
.os-teacher {
display:none
}
[data-type="list"],
.list {
overflow-wrap:break-word
}
[data-type="list"]>[data-type="title"],
.list>[data-type="title"],
[data-type="list"]>.title,
.list>.title {
font-weight:700
}
.footnote {
font-size:1rem
}
[data-type="footnote-ref"] {
text-indent:-27px;
padding-left:27px
}
.abstract {
position:relative;
background-color:#ededed;
padding:4.5rem 1.5rem 1.5rem;
margin:3rem 6rem 0
}
.abstract ul {
margin:1.5rem 0 0
}
.abstract ul::after {
position:absolute;
top:1.5rem;
left:1.5rem;
font-size:1.5rem;
font-weight:700;
color:#555;
text-transform:uppercase;
letter-spacing:.1rem;
content:"Abstract"
}
blockquote {
font-size:14px
}
[data-type="example"] [data-type="problem"],
[data-type="exercise"] [data-type="problem"],
.example [data-type="problem"],
.exercise [data-type="problem"],
[data-type="example"] [data-type="solution"],
[data-type="exercise"] [data-type="solution"],
.example [data-type="solution"],
.exercise [data-type="solution"],
[data-type="example"] .problem,
[data-type="exercise"] .problem,
.example .problem,
.exercise .problem,
[data-type="example"] .solution,
[data-type="exercise"] .solution,
.example .solution,
.exercise .solution {
padding:.5em 1em
}
.example [data-type="solution"],
.exercise [data-type="solution"],
.example .solution,
.exercise .solution {
border-top:.1rem solid #555
}
[data-type="example"] [data-type="solution"]>.ui-toggle-wrapper,
[data-type="exercise"] [data-type="solution"]>.ui-toggle-wrapper,
.example [data-type="solution"]>.ui-toggle-wrapper,
.exercise [data-type="solution"]>.ui-toggle-wrapper,
[data-type="example"] .solution>.ui-toggle-wrapper,
[data-type="exercise"] .solution>.ui-toggle-wrapper,
.example .solution>.ui-toggle-wrapper,
.exercise .solution>.ui-toggle-wrapper {
text-align:center
}
[data-type="example"] [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
[data-type="exercise"] [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
.example [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
.exercise [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
[data-type="example"] .solution>.ui-toggle-wrapper>.ui-toggle,
[data-type="exercise"] .solution>.ui-toggle-wrapper>.ui-toggle,
.example .solution>.ui-toggle-wrapper>.ui-toggle,
.exercise .solution>.ui-toggle-wrapper>.ui-toggle {
outline:0;
text-align:center;
font-weight:700
}
[data-type="example"] [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-type="exercise"] [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
.example [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
.exercise [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-type="example"] .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-type="exercise"] .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
.example .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
.exercise .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before {
content:'[Show Solution]'
}
[data-type="example"] [data-type="solution"]:not(.ui-solution-visible)>section,
[data-type="exercise"] [data-type="solution"]:not(.ui-solution-visible)>section,
.example [data-type="solution"]:not(.ui-solution-visible)>section,
.exercise [data-type="solution"]:not(.ui-solution-visible)>section,
[data-type="example"] .solution:not(.ui-solution-visible)>section,
[data-type="exercise"] .solution:not(.ui-solution-visible)>section,
.example .solution:not(.ui-solution-visible)>section,
.exercise .solution:not(.ui-solution-visible)>section {
display:none
}
[data-type="example"] [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-type="exercise"] [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
.example [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
.exercise [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-type="example"] .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-type="exercise"] .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
.example .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
.exercise .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before {
content:'[Hide Solution]'
}
[data-type="example"].check-understanding [data-type="title"]::before,
[data-type="exercise"].check-understanding [data-type="title"]::before,
.example.check-understanding [data-type="title"]::before,
.exercise.check-understanding [data-type="title"]::before,
[data-type="example"][data-type=check-understanding] .title::before,
[data-type="exercise"][data-type=check-understanding] .title::before,
.example[data-type=check-understanding] .title::before,
.exercise[data-type=check-understanding] .title::before {
margin-right:0;
content:""
}
[data-type="example"].conceptual-questions [data-type="problem"],
[data-type="exercise"].conceptual-questions [data-type="problem"],
.example.conceptual-questions [data-type="problem"],
.exercise.conceptual-questions [data-type="problem"],
[data-type="example"][data-type=conceptual-questions] .problem,
[data-type="exercise"][data-type=conceptual-questions] .problem,
.example[data-type=conceptual-questions] .problem,
.exercise[data-type=conceptual-questions] .problem {
border-top:none
}
[data-type="example"].conceptual-questions [data-type="problem"] p,
[data-type="exercise"].conceptual-questions [data-type="problem"] p,
.example.conceptual-questions [data-type="problem"] p,
.exercise.conceptual-questions [data-type="problem"] p,
[data-type="example"][data-type=conceptual-questions] .problem p,
[data-type="exercise"][data-type=conceptual-questions] .problem p,
.example[data-type=conceptual-questions] .problem p,
.exercise[data-type=conceptual-questions] .problem p {
margin:0
}
[data-type="example"].problems-exercises [data-type="problem"]::before,
[data-type="exercise"].problems-exercises [data-type="problem"]::before,
.example.problems-exercises [data-type="problem"]::before,
.exercise.problems-exercises [data-type="problem"]::before,
[data-type="example"][data-type=problems-exercises] [data-type="problem"]::before,
[data-type="exercise"][data-type=problems-exercises] [data-type="problem"]::before,
.example[data-type=problems-exercises] [data-type="problem"]::before,
.exercise[data-type=problems-exercises] [data-type="problem"]::before,
[data-type="example"].problems-exercises [data-type="solution"]::before,
[data-type="exercise"].problems-exercises [data-type="solution"]::before,
.example.problems-exercises [data-type="solution"]::before,
.exercise.problems-exercises [data-type="solution"]::before,
[data-type="example"][data-type=problems-exercises] [data-type="solution"]::before,
[data-type="exercise"][data-type=problems-exercises] [data-type="solution"]::before,
.example[data-type=problems-exercises] [data-type="solution"]::before,
.exercise[data-type=problems-exercises] [data-type="solution"]::before,
[data-type="example"].problems-exercises .problem::before,
[data-type="exercise"].problems-exercises .problem::before,
.example.problems-exercises .problem::before,
.exercise.problems-exercises .problem::before,
[data-type="example"][data-type=problems-exercises] .problem::before,
[data-type="exercise"][data-type=problems-exercises] .problem::before,
.example[data-type=problems-exercises] .problem::before,
.exercise[data-type=problems-exercises] .problem::before,
[data-type="example"].problems-exercises .solution::before,
[data-type="exercise"].problems-exercises .solution::before,
.example.problems-exercises .solution::before,
.exercise.problems-exercises .solution::before,
[data-type="example"][data-type=problems-exercises] .solution::before,
[data-type="exercise"][data-type=problems-exercises] .solution::before,
.example[data-type=problems-exercises] .solution::before,
.exercise[data-type=problems-exercises] .solution::before {
font-weight:700;
color:#555;
text-transform:uppercase;
letter-spacing:.1rem
}
[data-type="example"].problems-exercises [data-type="problem"]::before,
[data-type="exercise"].problems-exercises [data-type="problem"]::before,
.example.problems-exercises [data-type="problem"]::before,
.exercise.problems-exercises [data-type="problem"]::before,
[data-type="example"][data-type=problems-exercises] [data-type="problem"]::before,
[data-type="exercise"][data-type=problems-exercises] [data-type="problem"]::before,
.example[data-type=problems-exercises] [data-type="problem"]::before,
.exercise[data-type=problems-exercises] [data-type="problem"]::before,
[data-type="example"].problems-exercises .problem::before,
[data-type="exercise"].problems-exercises .problem::before,
.example.problems-exercises .problem::before,
.exercise.problems-exercises .problem::before,
[data-type="example"][data-type=problems-exercises] .problem::before,
[data-type="exercise"][data-type=problems-exercises] .problem::before,
.example[data-type=problems-exercises] .problem::before,
.exercise[data-type=problems-exercises] .problem::before {
content:"Problem"
}
[data-type="example"].problems-exercises [data-type="solution"]::before .solution::before,
[data-type="exercise"].problems-exercises [data-type="solution"]::before .solution::before,
.example.problems-exercises [data-type="solution"]::before .solution::before,
.exercise.problems-exercises [data-type="solution"]::before .solution::before,
[data-type="example"][data-type=problems-exercises] [data-type="solution"]::before .solution::before,
[data-type="exercise"][data-type=problems-exercises] [data-type="solution"]::before .solution::before,
.example[data-type=problems-exercises] [data-type="solution"]::before .solution::before,
.exercise[data-type=problems-exercises] [data-type="solution"]::before .solution::before {
content:"Solution"
}
.table-wrapper {
overflow-x:auto
}
table {
margin-top:6rem;
width:100%;
max-width:100%;
margin-bottom:20px;
background-color:transparent;
counter-increment:table
}
table caption {
margin-top:.5rem;
font-size:1.3rem;
text-align:left;
caption-side:bottom
}
table caption sup {
top:auto;
line-height:inherit
}
table caption>.title {
display:block;
font-size:1.6rem;
font-weight:700
}
table caption>.title::before {
margin-right:.5rem;
color:#606163;
font-weight:700;
content:"Table " counter(table)"."
}
table thead tr>td[data-align="right"],
table tbody tr>td[data-align="right"] {
text-align:right
}
table tfoot>tr>th,
table tfoot>tr>td {
padding:1em;
line-height:1.42857143;
vertical-align:top;
border-top:.1rem solid #ddd
}
table thead>tr>th,
table thead>tr>td {
vertical-align:bottom;
border-bottom:.2rem solid #ddd;
font-weight:700;
text-align:left
}
table caption+thead tr:first-child th,
table colgroup+thead tr:first-child th,
table thead:first-child tr:first-child th,
table caption+thead tr:first-child td,
table colgroup+thead tr:first-child td,
table thead:first-child tr:first-child td {
border-top:0
}
table tbody+tbody {
border-top:.2rem solid #ddd
}
table table {
background-color:#fff
}
table>tbody>tr:nth-child(odd)>td,
table>tbody>tr:nth-child(odd)>th {
background-color:#f9f9f9
}
[data-type="glossary"] [data-type="definition"] {
margin:1rem 3rem
}
[data-type="equation"] {
overflow:auto
}
h1,
h2,
h3,
h4,
h5,
h6 {
margin:1.5rem 0 1rem;
font-weight:700
}
h3+section {
margin-top:0
}
ul,
ol {
color:#555;
margin-bottom:1rem;
margin-top:1rem
}
.os-stepwise {
list-style-type:none;
padding-left:0
}
.os-stepwise>li {
display:flex
}
.os-stepwise>li .os-stepwise-token {
white-space:pre
}
.os-stepwise>li .os-stepwise-content>ul,
.os-stepwise>li .os-stepwise-content ol {
padding-left:1rem
}
.circled {
list-style-type:none;
padding-left:1rem
}
[data-bullet-style="none"] {
list-style-type:none
}
iframe {
display:block;
margin:3rem auto
}
.centered-text {
display:block;
text-align:center;
font-weight:400
}
.os-chapter-outline ul {
margin-top:0
}
.colored-text {
color:#c00
}
.no-emphasis {
font-weight:400
}
[data-type="page"]>[data-type="document-title"],
[data-type="composite-page"]>[data-type="document-title"] {
display:none
}
section,
figure,
[data-type="glossary"],
[data-type="footnote-refs"] {
margin-top:6rem
}
section>ol>li::before,
figure>ol>li::before,
[data-type="glossary"]>ol>li::before,
[data-type="footnote-refs"]>ol>li::before {
content:""!important
}
.splash {
margin-top:0
}
.splash:not([data-orient="vertical"]) {
display:block
}
.splash:not([data-orient="vertical"]) img {
width:100%
}
.os-figure {
display:table;
margin:3rem auto
}
.os-figure .os-caption-container {
padding-top:1rem;
display:table-caption;
caption-side:bottom;
font-size:1.2rem;
color:#555
}
.os-figure .os-caption-container .os-title-label,
.os-figure .os-caption-container .os-number,
.os-figure .os-caption-container .os-title {
font-weight:700
}
h1.example-title .text {
padding-left:1rem
}
[data-type="note"],
.note {
margin:3rem 0;
padding:1.5rem;
background-color:#ededed;
border:.2rem solid #dcdcdc
}
@media (max-width:767px) {
[data-type="note"],
.note {
 margin-left:0;
 margin-right:0
}
}
[data-type="note"]>p,
.note>p {
margin-top:0
}
[data-type="note"]:not([data-label]).ui-has-child-title>header>[data-type="title"],
.note:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-type="note"]:not([data-label]).ui-has-child-title>[data-type="title"],
.note:not([data-label]).ui-has-child-title>[data-type="title"],
[data-type="note"]:not([data-label]).ui-has-child-title>header>.title,
.note:not([data-label]).ui-has-child-title>header>.title,
[data-type="note"]:not([data-label]).ui-has-child-title>header>.os-title,
.note:not([data-label]).ui-has-child-title>header>.os-title,
[data-type="note"]:not([data-label]).ui-has-child-title>.title,
.note:not([data-label]).ui-has-child-title>.title,
[data-type="note"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"],
.note:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
font-weight:700;
text-transform:uppercase;
letter-spacing:.1rem;
display:block;
margin-bottom:1rem;
margin-top:0;
padding:0 1.5rem 1rem;
border-bottom:.2rem solid #dcdcdc
}
[data-type="note"]:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
.note:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-type="note"]:not([data-label]).ui-has-child-title>[data-type="title"]::before,
.note:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-type="note"]:not([data-label]).ui-has-child-title>header>.title::before,
.note:not([data-label]).ui-has-child-title>header>.title::before,
[data-type="note"]:not([data-label]).ui-has-child-title>header>.os-title::before,
.note:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-type="note"]:not([data-label]).ui-has-child-title>.title::before,
.note:not([data-label]).ui-has-child-title>.title::before,
[data-type="note"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
.note:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-type="note"][data-label=''].ui-has-child-title>header>[data-type="title"],
.note[data-label=''].ui-has-child-title>header>[data-type="title"],
[data-type="note"][data-label=''].ui-has-child-title>[data-type="title"],
.note[data-label=''].ui-has-child-title>[data-type="title"],
[data-type="note"][data-label=''].ui-has-child-title>header>.title,
.note[data-label=''].ui-has-child-title>header>.title,
[data-type="note"][data-label=''].ui-has-child-title>header>.os-title,
.note[data-label=''].ui-has-child-title>header>.os-title,
[data-type="note"][data-label=''].ui-has-child-title>.title,
.note[data-label=''].ui-has-child-title>.title,
[data-type="note"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"],
.note[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
font-weight:700;
text-transform:uppercase;
letter-spacing:.1rem;
display:block;
margin-bottom:1rem;
margin-top:0;
padding:0 1.5rem 1rem;
border-bottom:.2rem solid #dcdcdc
}
[data-type="note"][data-label=''].ui-has-child-title>header>[data-type="title"]::before,
.note[data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-type="note"][data-label=''].ui-has-child-title>[data-type="title"]::before,
.note[data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-type="note"][data-label=''].ui-has-child-title>header>.title::before,
.note[data-label=''].ui-has-child-title>header>.title::before,
[data-type="note"][data-label=''].ui-has-child-title>header>.os-title::before,
.note[data-label=''].ui-has-child-title>header>.os-title::before,
[data-type="note"][data-label=''].ui-has-child-title>.title::before,
.note[data-label=''].ui-has-child-title>.title::before,
[data-type="note"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before,
.note[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
.note[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
.note[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.title,
.note[data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
.note[data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>.title,
.note[data-label]:not([data-label='']).ui-has-child-title>.title,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"],
.note[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
font-weight:700;
text-transform:uppercase;
letter-spacing:.1rem;
display:block;
margin-bottom:1rem;
margin-top:0;
padding:0 1.5rem 1rem;
border-bottom:.2rem solid #dcdcdc
}
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
.note[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
.note[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
.note[data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
.note[data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title>.title::before,
.note[data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-type="note"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
.note[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-type="note"]>section,
.note>section {
border-top:none;
padding:0 1.5rem;
background-color:#ededed;
color:#555
}
[data-type="note"]>section p,
.note>section p {
margin:0 0 1rem
}
[data-type="note"]>section ul,
.note>section ul,
[data-type="note"]>section ol,
.note>section ol {
color:#555
}
[data-type="note"]>section span[data-type="media"],
.note>section span[data-type="media"] {
display:block;
margin:1rem 0
}
[data-type="example"],
.example {
margin:3rem 0;
padding:1.5rem;
background-color:#ededed;
border:.2rem solid #dcdcdc
}
[data-type="example"]>p,
.example>p {
margin-top:0
}
[data-type="example"]:not([data-label]).ui-has-child-title>header>[data-type="title"],
.example:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-type="example"]:not([data-label]).ui-has-child-title>[data-type="title"],
.example:not([data-label]).ui-has-child-title>[data-type="title"],
[data-type="example"]:not([data-label]).ui-has-child-title>header>.title,
.example:not([data-label]).ui-has-child-title>header>.title,
[data-type="example"]:not([data-label]).ui-has-child-title>header>.os-title,
.example:not([data-label]).ui-has-child-title>header>.os-title,
[data-type="example"]:not([data-label]).ui-has-child-title>.title,
.example:not([data-label]).ui-has-child-title>.title,
[data-type="example"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"],
.example:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
font-weight:700;
text-transform:uppercase;
letter-spacing:.1rem;
display:block;
margin-bottom:1rem;
margin-top:0;
padding:0 1.5rem 1rem;
border-bottom:.2rem solid #dcdcdc
}
[data-type="example"]:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
.example:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-type="example"]:not([data-label]).ui-has-child-title>[data-type="title"]::before,
.example:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-type="example"]:not([data-label]).ui-has-child-title>header>.title::before,
.example:not([data-label]).ui-has-child-title>header>.title::before,
[data-type="example"]:not([data-label]).ui-has-child-title>header>.os-title::before,
.example:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-type="example"]:not([data-label]).ui-has-child-title>.title::before,
.example:not([data-label]).ui-has-child-title>.title::before,
[data-type="example"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
.example:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-type="example"][data-label=''].ui-has-child-title>header>[data-type="title"],
.example[data-label=''].ui-has-child-title>header>[data-type="title"],
[data-type="example"][data-label=''].ui-has-child-title>[data-type="title"],
.example[data-label=''].ui-has-child-title>[data-type="title"],
[data-type="example"][data-label=''].ui-has-child-title>header>.title,
.example[data-label=''].ui-has-child-title>header>.title,
[data-type="example"][data-label=''].ui-has-child-title>header>.os-title,
.example[data-label=''].ui-has-child-title>header>.os-title,
[data-type="example"][data-label=''].ui-has-child-title>.title,
.example[data-label=''].ui-has-child-title>.title,
[data-type="example"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"],
.example[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
font-weight:700;
text-transform:uppercase;
letter-spacing:.1rem;
display:block;
margin-bottom:1rem;
margin-top:0;
padding:0 1.5rem 1rem;
border-bottom:.2rem solid #dcdcdc
}
[data-type="example"][data-label=''].ui-has-child-title>header>[data-type="title"]::before,
.example[data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-type="example"][data-label=''].ui-has-child-title>[data-type="title"]::before,
.example[data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-type="example"][data-label=''].ui-has-child-title>header>.title::before,
.example[data-label=''].ui-has-child-title>header>.title::before,
[data-type="example"][data-label=''].ui-has-child-title>header>.os-title::before,
.example[data-label=''].ui-has-child-title>header>.os-title::before,
[data-type="example"][data-label=''].ui-has-child-title>.title::before,
.example[data-label=''].ui-has-child-title>.title::before,
[data-type="example"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before,
.example[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
.example[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
.example[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.title,
.example[data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
.example[data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>.title,
.example[data-label]:not([data-label='']).ui-has-child-title>.title,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"],
.example[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
font-weight:700;
text-transform:uppercase;
letter-spacing:.1rem;
display:block;
margin-bottom:1rem;
margin-top:0;
padding:0 1.5rem 1rem;
border-bottom:.2rem solid #dcdcdc
}
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
.example[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
.example[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
.example[data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
.example[data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title>.title::before,
.example[data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-type="example"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
.example[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-type="example"]>section,
.example>section {
border-top:none;
padding:0 1.5rem;
background-color:#ededed;
color:#555
}
[data-type="example"]>section p,
.example>section p {
margin:0 0 1rem
}
[data-type="example"]>section ul,
.example>section ul,
[data-type="example"]>section ol,
.example>section ol {
color:#555
}
[data-type="example"]>section span[data-type="media"],
.example>section span[data-type="media"] {
display:block;
margin:1rem 0
}
[data-type="problem"],
[data-type="solution"],
.problem,
.solution {
padding:0
}
.os-eoc .os-problem-container,
.os-eob .os-problem-container,
.section-exercises .os-problem-container,
.os-eoc .os-solution-container,
.os-eob .os-solution-container,
.section-exercises .os-solution-container {
display:inline
}
.os-eoc .os-problem-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
.os-eob .os-problem-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
.section-exercises .os-problem-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
.os-eoc .os-solution-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
.os-eob .os-solution-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
.section-exercises .os-solution-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure) {
display:inline
}
.os-eoc .os-problem-container>ul,
.os-eob .os-problem-container>ul,
.section-exercises .os-problem-container>ul,
.os-eoc .os-solution-container>ul,
.os-eob .os-solution-container>ul,
.section-exercises .os-solution-container>ul,
.os-eoc .os-problem-container>ol,
.os-eob .os-problem-container>ol,
.section-exercises .os-problem-container>ol,
.os-eoc .os-solution-container>ol,
.os-eob .os-solution-container>ol,
.section-exercises .os-solution-container>ol,
.os-eoc .os-problem-container [data-type="note"],
.os-eob .os-problem-container [data-type="note"],
.section-exercises .os-problem-container [data-type="note"],
.os-eoc .os-solution-container [data-type="note"],
.os-eob .os-solution-container [data-type="note"],
.section-exercises .os-solution-container [data-type="note"] {
margin-top:0
}
.os-eoc .os-problem-container .os-figure,
.os-eob .os-problem-container .os-figure,
.section-exercises .os-problem-container .os-figure,
.os-eoc .os-solution-container .os-figure,
.os-eob .os-solution-container .os-figure,
.section-exercises .os-solution-container .os-figure {
margin:3rem 0
}
.os-eob .os-solution-container img,
.os-eos .os-solution-container img,
.os-eob .os-problem-container img,
.os-eos .os-problem-container img {
display:block
}
.review-questions [type="a"],
.os-review-questions-container [type="a"] {
list-style-type:upper-alpha
}
[data-type="exercise"] [data-type="problem"] p:first-of-type {
display:inline
}
[data-type="exercise"] [data-type="problem"] p:first-of-type a {
font-weight:700;
margin-right:.5em
}
[data-type="note"] [data-type="solution"],
[data-type="exercise"] [data-type="solution"],
[data-type="example"] [data-type="solution"],
[data-type="note"] .solution,
[data-type="exercise"] .solution,
[data-type="example"] .solution {
border-top:.1rem solid #dcdcdc
}
[data-type="example"] .os-solution-container,
[data-type="example"] .os-solution-container p {
margin-top:1rem
}
.equation,
[data-type="equation"] {
display:table;
width:100%
}
.equation .os-equation-number,
[data-type="equation"] .os-equation-number {
display:table-cell;
vertical-align:middle;
width:5%
}
.equation .os-equation-number .os-number,
[data-type="equation"] .os-equation-number .os-number {
border:#000 solid 1px;
padding:5px;
text-align:center;
vertical-align:middle
}
.equation [data-type="title"],
[data-type="equation"] [data-type="title"] {
display:block;
text-align:center;
font-weight:700
}
.os-note-body img {
display:block
}
.os-table table thead tr th .MathJax_Display {
width:auto!important;
float:left!important;
margin:0
}
.swipe-table {
-webkit-touch-callout:none;
-webkit-user-select:none;
-khtml-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none;
cursor:-webkit-grab
}
.os-table {
overflow-x:auto;
margin:20px 0
}
.os-table .os-table-title {
text-align:center;
font-weight:700;
padding-bottom:1em
}
.os-table table {
margin:0
}
.os-table table.has-images {
table-layout:fixed
}
.os-table table tr td,
.os-table table tr th {
padding:1em
}
.os-table table tr td {
vertical-align:middle
}
.os-table table tr [data-valign="top"] {
vertical-align:top
}
.os-table table tr [data-align="center"] {
text-align:center
}
.os-table table ul,
.os-table table ol {
padding-left:1.5em
}
.os-table table ul[data-bullet-style="none"],
.os-table table ol[data-bullet-style="none"] {
padding:0;
margin:0
}
.os-table table ul[data-bullet-style="none"] li,
.os-table table ol[data-bullet-style="none"] li {
list-style:none
}
.os-table table .os-figure,
.os-table table .os-figure img {
margin:0
}
.os-table table .os-figure .os-caption-container {
padding:1rem 0 0
}
.os-table .os-caption-container {
font-size:.9em;
padding:8px;
border-top:.1rem solid #dcdcdc
}
.os-table .os-caption-container .os-title-label,
.os-table .os-caption-container .os-number {
font-weight:700;
display:inline-block;
padding-right:.25em
}
.os-eoc h2[data-type="document-title"],
.os-eob h2[data-type="document-title"],
.os-eoc h2.os-title,
.os-eob h2.os-title {
font-size:2.1rem;
font-weight:700
}
.os-eoc .os-number,
.os-eob .os-number {
font-weight:700;
text-decoration:none
}
.os-eoc .group-by .os-index-item:not(:first-of-type),
.os-eob .group-by .os-index-item:not(:first-of-type) {
margin-top:.5rem
}
.os-eoc .group-by .os-index-item .os-term,
.os-eob .group-by .os-index-item .os-term {
font-weight:700;
padding-right:.5rem
}
.os-eoc .group-label,
.os-eob .group-label {
display:block;
font-size:2.1rem;
font-weight:700;
margin:1.5rem 0 1rem
}
.os-eoc.os-reference-container>.os-chapter-area>.reference span.os-reference-number,
.os-eob.os-reference-container>.os-chapter-area>.reference span.os-reference-number,
.os-eoc.os-references-container .references .os-note-body>a,
.os-eob.os-references-container .references .os-note-body>a {
margin-right:10px
}
.os-eoc [data-type="list"]>[data-type="title"],
.os-eob [data-type="list"]>[data-type="title"],
.os-eoc .list>[data-type="title"],
.os-eob .list>[data-type="title"],
.os-eoc [data-type="list"]>.title,
.os-eob [data-type="list"]>.title,
.os-eoc .list>.title,
.os-eob .list>.title {
margin-top:15px
}
.os-reference-number {
font-weight:700
}
.os-eoc [data-type="exercise"] [data-type="problem"]>.number,
.os-eoc .exercise [data-type="problem"]>.number {
font-weight:700;
text-decoration:none
}
.os-eoc [data-type="exercise"] img,
.os-eoc .exercise img {
display:block;
margin-bottom:1em
}
.os-solutions-container [data-type="solution"] {
padding:.5em .25em .5em 0
}
.os-solutions-container [data-type="solution"]>a {
font-weight:700;
text-decoration:none
}
.os-solutions-container [data-type="solution"] p {
display:inline
}
.os-solutions-container [data-type="solution"] p::before {
content:" "
}
.os-chapter-area [data-type="solution"] p {
display:inline
}
.appendix [data-type="list"] {
margin-top:1rem
}
figure.scaled-down,
figure.scaled-down~.os-caption-container {
width:60%;
margin:auto
}
figure.scaled-down-30,
figure.scaled-down-30~.os-caption-container {
width:30%;
margin:auto
}
:not(figure)>[data-type="media"].scaled-down {
text-align:center;
display:block
}
:not(figure)>[data-type="media"].scaled-down img {
width:60%
}
:not(figure)>[data-type="media"].scaled-down-30 {
text-align:center;
display:block
}
:not(figure)>[data-type="media"].scaled-down-30 img {
width:30%
}
.learning-objectives {
margin:3rem 0;
padding:1.5rem;
background-color:#ededed;
border:.2rem solid #dcdcdc
}
.learning-objectives [data-type="title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
font-weight:700;
text-transform:uppercase;
letter-spacing:.1rem;
display:block;
margin-bottom:1rem;
margin-top:0;
padding:0 1.5rem 1rem;
border-bottom:.2rem solid #dcdcdc
}
.learning-objectives p {
color:#555;
margin:0 0 1rem 1.5rem
}
.not-converted-yet {
visibility:hidden
}

`;
