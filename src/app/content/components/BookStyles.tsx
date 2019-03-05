// tslint:disable:variable-name
// import bookStyles from 'cnx-recipes/styles/output/intro-business.json';
import { ReactElement } from 'react';
import styled from 'styled-components';

const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

export default styled(Hoc)`
/*!
* Bootstrap v3.3.5 (http://getbootstrap.com)
* Copyright 2011-2015 Twitter, Inc.
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
*/html {
font-family:sans-serif;
-ms-text-size-adjust:100%;
-webkit-text-size-adjust:100%
}
body {
margin:0
}
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
menu,
nav,
section,
summary {
display:block
}
audio,
canvas,
progress,
video {
display:inline-block;
vertical-align:baseline
}
audio:not([controls]) {
display:none;
height:0
}
[hidden],
template {
display:none
}
a {
background-color:transparent
}
a:active,
a:hover {
outline:0
}
b,
strong {
font-weight:700
}
dfn {
font-style:italic
}
mark {
background:#ff0;
color:#000
}
sub,
sup {
font-size:75%;
line-height:0;
position:relative;
vertical-align:baseline
}
sup {
top:-.5em
}
sub {
bottom:-.25em
}
img {
border:0
}
svg:not(:root) {
overflow:hidden
}
hr {
box-sizing:content-box;
height:0
}
pre {
overflow:auto
}
samp {
font-size:1em
}
button,
input,
optgroup,
select,
textarea {
color:inherit;
font:inherit;
margin:0
}
button {
overflow:visible
}
button,
select {
text-transform:none
}
button,
html input[type="button"],
input[type="reset"],
input[type="submit"] {
-webkit-appearance:button;
cursor:pointer
}
button[disabled],
html input[disabled] {
cursor:default
}
button::-moz-focus-inner,
input::-moz-focus-inner {
border:0;
padding:0
}
input[type="checkbox"],
input[type="radio"] {
box-sizing:border-box;
padding:0
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
height:auto
}
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-decoration {
-webkit-appearance:none
}
fieldset {
border:1px solid silver
}
textarea {
overflow:auto
}
optgroup {
font-weight:700
}
table {
border-collapse:collapse;
border-spacing:0
}
td,
th {
padding:0
}
@media print {
*,
*:before,
*:after {
 background:transparent!important;
 color:#000!important;
 box-shadow:none!important;
 text-shadow:none!important
}
a,
a:visited {
 text-decoration:underline
}
a[href]:after {
 content:" (" attr(href)")"
}
abbr[title]:after {
 content:" (" attr(title)")"
}
a[href^="#"]:after,
a[href^="javascript:"]:after {
 content:""
}
pre,
blockquote {
 border:1px solid #999;
 page-break-inside:avoid
}
thead {
 display:table-header-group
}
tr,
img {
 page-break-inside:avoid
}
img {
 max-width:100%!important
}
p,
h2,
h3 {
 orphans:3;
 widows:3
}
h2,
h3 {
 page-break-after:avoid
}
.navbar {
 display:none
}
.btn>.caret,
.dropup>.btn>.caret {
 border-top-color:#000!important
}
.label {
 border:1px solid #000
}
.table {
 border-collapse:collapse!important
}
.table td,
.table th {
 background-color:#fff!important
}
.table-bordered th,
.table-bordered td {
 border:1px solid #ddd!important
}
}
@font-face {
font-family:'Glyphicons Halflings';
src:url('scripts/../fonts/glyphicons-halflings-regular.eot');
src:url('scripts/../fonts/glyphicons-halflings-regular.eot?#iefix') format('embedded-opentype'),
url('scripts/../fonts/glyphicons-halflings-regular.woff2') format('woff2'),
url('scripts/../fonts/glyphicons-halflings-regular.woff') format('woff'),
url('scripts/../fonts/glyphicons-halflings-regular.ttf') format('truetype'),
url('scripts/../fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular') format('svg')
}
.glyphicon {
position:relative;
top:1px;
display:inline-block;
font-family:'Glyphicons Halflings';
font-style:normal;
font-weight:400;
line-height:1;
-webkit-font-smoothing:antialiased;
-moz-osx-font-smoothing:grayscale
}
.glyphicon-asterisk:before {
content:"\2a"
}
.glyphicon-plus:before {
content:"\2b"
}
.glyphicon-euro:before,
.glyphicon-eur:before {
content:"\20ac"
}
.glyphicon-minus:before {
content:"\2212"
}
.glyphicon-cloud:before {
content:"\2601"
}
.glyphicon-envelope:before {
content:"\2709"
}
.glyphicon-pencil:before {
content:"\270f"
}
.glyphicon-glass:before {
content:"\e001"
}
.glyphicon-music:before {
content:"\e002"
}
.glyphicon-search:before {
content:"\e003"
}
.glyphicon-heart:before {
content:"\e005"
}
.glyphicon-star:before {
content:"\e006"
}
.glyphicon-star-empty:before {
content:"\e007"
}
.glyphicon-user:before {
content:"\e008"
}
.glyphicon-film:before {
content:"\e009"
}
.glyphicon-th-large:before {
content:"\e010"
}
.glyphicon-th:before {
content:"\e011"
}
.glyphicon-th-list:before {
content:"\e012"
}
.glyphicon-ok:before {
content:"\e013"
}
.glyphicon-remove:before {
content:"\e014"
}
.glyphicon-zoom-in:before {
content:"\e015"
}
.glyphicon-zoom-out:before {
content:"\e016"
}
.glyphicon-off:before {
content:"\e017"
}
.glyphicon-signal:before {
content:"\e018"
}
.glyphicon-cog:before {
content:"\e019"
}
.glyphicon-trash:before {
content:"\e020"
}
.glyphicon-home:before {
content:"\e021"
}
.glyphicon-file:before {
content:"\e022"
}
.glyphicon-time:before {
content:"\e023"
}
.glyphicon-road:before {
content:"\e024"
}
.glyphicon-download-alt:before {
content:"\e025"
}
.glyphicon-download:before {
content:"\e026"
}
.glyphicon-upload:before {
content:"\e027"
}
.glyphicon-inbox:before {
content:"\e028"
}
.glyphicon-play-circle:before {
content:"\e029"
}
.glyphicon-repeat:before {
content:"\e030"
}
.glyphicon-refresh:before {
content:"\e031"
}
.glyphicon-list-alt:before {
content:"\e032"
}
.glyphicon-lock:before {
content:"\e033"
}
.glyphicon-flag:before {
content:"\e034"
}
.glyphicon-headphones:before {
content:"\e035"
}
.glyphicon-volume-off:before {
content:"\e036"
}
.glyphicon-volume-down:before {
content:"\e037"
}
.glyphicon-volume-up:before {
content:"\e038"
}
.glyphicon-qrcode:before {
content:"\e039"
}
.glyphicon-barcode:before {
content:"\e040"
}
.glyphicon-tag:before {
content:"\e041"
}
.glyphicon-tags:before {
content:"\e042"
}
.glyphicon-book:before {
content:"\e043"
}
.glyphicon-bookmark:before {
content:"\e044"
}
.glyphicon-print:before {
content:"\e045"
}
.glyphicon-camera:before {
content:"\e046"
}
.glyphicon-font:before {
content:"\e047"
}
.glyphicon-bold:before {
content:"\e048"
}
.glyphicon-italic:before {
content:"\e049"
}
.glyphicon-text-height:before {
content:"\e050"
}
.glyphicon-text-width:before {
content:"\e051"
}
.glyphicon-align-left:before {
content:"\e052"
}
.glyphicon-align-center:before {
content:"\e053"
}
.glyphicon-align-right:before {
content:"\e054"
}
.glyphicon-align-justify:before {
content:"\e055"
}
.glyphicon-list:before {
content:"\e056"
}
.glyphicon-indent-left:before {
content:"\e057"
}
.glyphicon-indent-right:before {
content:"\e058"
}
.glyphicon-facetime-video:before {
content:"\e059"
}
.glyphicon-picture:before {
content:"\e060"
}
.glyphicon-map-marker:before {
content:"\e062"
}
.glyphicon-adjust:before {
content:"\e063"
}
.glyphicon-tint:before {
content:"\e064"
}
.glyphicon-edit:before {
content:"\e065"
}
.glyphicon-share:before {
content:"\e066"
}
.glyphicon-check:before {
content:"\e067"
}
.glyphicon-move:before {
content:"\e068"
}
.glyphicon-step-backward:before {
content:"\e069"
}
.glyphicon-fast-backward:before {
content:"\e070"
}
.glyphicon-backward:before {
content:"\e071"
}
.glyphicon-play:before {
content:"\e072"
}
.glyphicon-pause:before {
content:"\e073"
}
.glyphicon-stop:before {
content:"\e074"
}
.glyphicon-forward:before {
content:"\e075"
}
.glyphicon-fast-forward:before {
content:"\e076"
}
.glyphicon-step-forward:before {
content:"\e077"
}
.glyphicon-eject:before {
content:"\e078"
}
.glyphicon-chevron-left:before {
content:"\e079"
}
.glyphicon-chevron-right:before {
content:"\e080"
}
.glyphicon-plus-sign:before {
content:"\e081"
}
.glyphicon-minus-sign:before {
content:"\e082"
}
.glyphicon-remove-sign:before {
content:"\e083"
}
.glyphicon-ok-sign:before {
content:"\e084"
}
.glyphicon-question-sign:before {
content:"\e085"
}
.glyphicon-info-sign:before {
content:"\e086"
}
.glyphicon-screenshot:before {
content:"\e087"
}
.glyphicon-remove-circle:before {
content:"\e088"
}
.glyphicon-ok-circle:before {
content:"\e089"
}
.glyphicon-ban-circle:before {
content:"\e090"
}
.glyphicon-arrow-left:before {
content:"\e091"
}
.glyphicon-arrow-right:before {
content:"\e092"
}
.glyphicon-arrow-up:before {
content:"\e093"
}
.glyphicon-arrow-down:before {
content:"\e094"
}
.glyphicon-share-alt:before {
content:"\e095"
}
.glyphicon-resize-full:before {
content:"\e096"
}
.glyphicon-resize-small:before {
content:"\e097"
}
.glyphicon-exclamation-sign:before {
content:"\e101"
}
.glyphicon-gift:before {
content:"\e102"
}
.glyphicon-leaf:before {
content:"\e103"
}
.glyphicon-fire:before {
content:"\e104"
}
.glyphicon-eye-open:before {
content:"\e105"
}
.glyphicon-eye-close:before {
content:"\e106"
}
.glyphicon-warning-sign:before {
content:"\e107"
}
.glyphicon-plane:before {
content:"\e108"
}
.glyphicon-calendar:before {
content:"\e109"
}
.glyphicon-random:before {
content:"\e110"
}
.glyphicon-comment:before {
content:"\e111"
}
.glyphicon-magnet:before {
content:"\e112"
}
.glyphicon-chevron-up:before {
content:"\e113"
}
.glyphicon-chevron-down:before {
content:"\e114"
}
.glyphicon-retweet:before {
content:"\e115"
}
.glyphicon-shopping-cart:before {
content:"\e116"
}
.glyphicon-folder-close:before {
content:"\e117"
}
.glyphicon-folder-open:before {
content:"\e118"
}
.glyphicon-resize-vertical:before {
content:"\e119"
}
.glyphicon-resize-horizontal:before {
content:"\e120"
}
.glyphicon-hdd:before {
content:"\e121"
}
.glyphicon-bullhorn:before {
content:"\e122"
}
.glyphicon-bell:before {
content:"\e123"
}
.glyphicon-certificate:before {
content:"\e124"
}
.glyphicon-thumbs-up:before {
content:"\e125"
}
.glyphicon-thumbs-down:before {
content:"\e126"
}
.glyphicon-hand-right:before {
content:"\e127"
}
.glyphicon-hand-left:before {
content:"\e128"
}
.glyphicon-hand-up:before {
content:"\e129"
}
.glyphicon-hand-down:before {
content:"\e130"
}
.glyphicon-circle-arrow-right:before {
content:"\e131"
}
.glyphicon-circle-arrow-left:before {
content:"\e132"
}
.glyphicon-circle-arrow-up:before {
content:"\e133"
}
.glyphicon-circle-arrow-down:before {
content:"\e134"
}
.glyphicon-globe:before {
content:"\e135"
}
.glyphicon-wrench:before {
content:"\e136"
}
.glyphicon-tasks:before {
content:"\e137"
}
.glyphicon-filter:before {
content:"\e138"
}
.glyphicon-briefcase:before {
content:"\e139"
}
.glyphicon-fullscreen:before {
content:"\e140"
}
.glyphicon-dashboard:before {
content:"\e141"
}
.glyphicon-paperclip:before {
content:"\e142"
}
.glyphicon-heart-empty:before {
content:"\e143"
}
.glyphicon-link:before {
content:"\e144"
}
.glyphicon-phone:before {
content:"\e145"
}
.glyphicon-pushpin:before {
content:"\e146"
}
.glyphicon-usd:before {
content:"\e148"
}
.glyphicon-gbp:before {
content:"\e149"
}
.glyphicon-sort:before {
content:"\e150"
}
.glyphicon-sort-by-alphabet:before {
content:"\e151"
}
.glyphicon-sort-by-alphabet-alt:before {
content:"\e152"
}
.glyphicon-sort-by-order:before {
content:"\e153"
}
.glyphicon-sort-by-order-alt:before {
content:"\e154"
}
.glyphicon-sort-by-attributes:before {
content:"\e155"
}
.glyphicon-sort-by-attributes-alt:before {
content:"\e156"
}
.glyphicon-unchecked:before {
content:"\e157"
}
.glyphicon-expand:before {
content:"\e158"
}
.glyphicon-collapse-down:before {
content:"\e159"
}
.glyphicon-collapse-up:before {
content:"\e160"
}
.glyphicon-log-in:before {
content:"\e161"
}
.glyphicon-flash:before {
content:"\e162"
}
.glyphicon-log-out:before {
content:"\e163"
}
.glyphicon-new-window:before {
content:"\e164"
}
.glyphicon-record:before {
content:"\e165"
}
.glyphicon-save:before {
content:"\e166"
}
.glyphicon-open:before {
content:"\e167"
}
.glyphicon-saved:before {
content:"\e168"
}
.glyphicon-import:before {
content:"\e169"
}
.glyphicon-export:before {
content:"\e170"
}
.glyphicon-send:before {
content:"\e171"
}
.glyphicon-floppy-disk:before {
content:"\e172"
}
.glyphicon-floppy-saved:before {
content:"\e173"
}
.glyphicon-floppy-remove:before {
content:"\e174"
}
.glyphicon-floppy-save:before {
content:"\e175"
}
.glyphicon-floppy-open:before {
content:"\e176"
}
.glyphicon-credit-card:before {
content:"\e177"
}
.glyphicon-transfer:before {
content:"\e178"
}
.glyphicon-cutlery:before {
content:"\e179"
}
.glyphicon-header:before {
content:"\e180"
}
.glyphicon-compressed:before {
content:"\e181"
}
.glyphicon-earphone:before {
content:"\e182"
}
.glyphicon-phone-alt:before {
content:"\e183"
}
.glyphicon-tower:before {
content:"\e184"
}
.glyphicon-stats:before {
content:"\e185"
}
.glyphicon-sd-video:before {
content:"\e186"
}
.glyphicon-hd-video:before {
content:"\e187"
}
.glyphicon-subtitles:before {
content:"\e188"
}
.glyphicon-sound-stereo:before {
content:"\e189"
}
.glyphicon-sound-dolby:before {
content:"\e190"
}
.glyphicon-sound-5-1:before {
content:"\e191"
}
.glyphicon-sound-6-1:before {
content:"\e192"
}
.glyphicon-sound-7-1:before {
content:"\e193"
}
.glyphicon-copyright-mark:before {
content:"\e194"
}
.glyphicon-registration-mark:before {
content:"\e195"
}
.glyphicon-cloud-download:before {
content:"\e197"
}
.glyphicon-cloud-upload:before {
content:"\e198"
}
.glyphicon-tree-conifer:before {
content:"\e199"
}
.glyphicon-tree-deciduous:before {
content:"\e200"
}
.glyphicon-cd:before {
content:"\e201"
}
.glyphicon-save-file:before {
content:"\e202"
}
.glyphicon-open-file:before {
content:"\e203"
}
.glyphicon-level-up:before {
content:"\e204"
}
.glyphicon-copy:before {
content:"\e205"
}
.glyphicon-paste:before {
content:"\e206"
}
.glyphicon-alert:before {
content:"\e209"
}
.glyphicon-equalizer:before {
content:"\e210"
}
.glyphicon-king:before {
content:"\e211"
}
.glyphicon-queen:before {
content:"\e212"
}
.glyphicon-pawn:before {
content:"\e213"
}
.glyphicon-bishop:before {
content:"\e214"
}
.glyphicon-knight:before {
content:"\e215"
}
.glyphicon-baby-formula:before {
content:"\e216"
}
.glyphicon-tent:before {
content:"\26fa"
}
.glyphicon-blackboard:before {
content:"\e218"
}
.glyphicon-bed:before {
content:"\e219"
}
.glyphicon-apple:before {
content:"\f8ff"
}
.glyphicon-erase:before {
content:"\e221"
}
.glyphicon-hourglass:before {
content:"\231b"
}
.glyphicon-lamp:before {
content:"\e223"
}
.glyphicon-duplicate:before {
content:"\e224"
}
.glyphicon-piggy-bank:before {
content:"\e225"
}
.glyphicon-scissors:before {
content:"\e226"
}
.glyphicon-bitcoin:before,
.glyphicon-btc:before,
.glyphicon-xbt:before {
content:"\e227"
}
.glyphicon-yen:before,
.glyphicon-jpy:before {
content:"\00a5"
}
.glyphicon-ruble:before,
.glyphicon-rub:before {
content:"\20bd"
}
.glyphicon-scale:before {
content:"\e230"
}
.glyphicon-ice-lolly:before {
content:"\e231"
}
.glyphicon-ice-lolly-tasted:before {
content:"\e232"
}
.glyphicon-education:before {
content:"\e233"
}
.glyphicon-option-horizontal:before {
content:"\e234"
}
.glyphicon-option-vertical:before {
content:"\e235"
}
.glyphicon-menu-hamburger:before {
content:"\e236"
}
.glyphicon-modal-window:before {
content:"\e237"
}
.glyphicon-oil:before {
content:"\e238"
}
.glyphicon-grain:before {
content:"\e239"
}
.glyphicon-sunglasses:before {
content:"\e240"
}
.glyphicon-text-size:before {
content:"\e241"
}
.glyphicon-text-color:before {
content:"\e242"
}
.glyphicon-text-background:before {
content:"\e243"
}
.glyphicon-object-align-top:before {
content:"\e244"
}
.glyphicon-object-align-bottom:before {
content:"\e245"
}
.glyphicon-object-align-horizontal:before {
content:"\e246"
}
.glyphicon-object-align-left:before {
content:"\e247"
}
.glyphicon-object-align-vertical:before {
content:"\e248"
}
.glyphicon-object-align-right:before {
content:"\e249"
}
.glyphicon-triangle-right:before {
content:"\e250"
}
.glyphicon-triangle-left:before {
content:"\e251"
}
.glyphicon-triangle-bottom:before {
content:"\e252"
}
.glyphicon-triangle-top:before {
content:"\e253"
}
.glyphicon-console:before {
content:"\e254"
}
.glyphicon-superscript:before {
content:"\e255"
}
.glyphicon-subscript:before {
content:"\e256"
}
.glyphicon-menu-left:before {
content:"\e257"
}
.glyphicon-menu-right:before {
content:"\e258"
}
.glyphicon-menu-down:before {
content:"\e259"
}
.glyphicon-menu-up:before {
content:"\e260"
}
* {
-webkit-box-sizing:border-box;
-moz-box-sizing:border-box;
box-sizing:border-box
}
*:before,
*:after {
-webkit-box-sizing:border-box;
-moz-box-sizing:border-box;
box-sizing:border-box
}
html {
font-size:10px;
-webkit-tap-highlight-color:rgba(0,0,0,0)
}
body {
font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;
font-size:14px;
line-height:1.42857143;
color:#333;
background-color:#fff
}
input,
button,
select,
textarea {
font-family:inherit;
font-size:inherit;
line-height:inherit
}
a {
color:#21366b;
text-decoration:none
}
a:hover,
a:focus {
color:#0f1831;
text-decoration:underline
}
a:focus {
outline:thin dotted;
outline:5px auto -webkit-focus-ring-color;
outline-offset:-2px
}
figure {
margin:0
}
img {
vertical-align:middle
}
.img-responsive,
.thumbnail>img,
.thumbnail a>img,
.carousel-inner>.item>img,
.carousel-inner>.item>a>img {
display:block;
max-width:100%;
height:auto
}
.img-rounded {
border-radius:6px
}
.img-thumbnail {
padding:4px;
line-height:1.42857143;
background-color:#fff;
border:1px solid #ddd;
border-radius:4px;
-webkit-transition:all .2s ease-in-out;
-o-transition:all .2s ease-in-out;
transition:all .2s ease-in-out;
display:inline-block;
max-width:100%;
height:auto
}
.img-circle {
border-radius:50%
}
hr {
margin-top:20px;
margin-bottom:20px;
border:0;
border-top:1px solid #dcdcdc
}
.sr-only {
position:absolute;
width:1px;
height:1px;
margin:-1px;
padding:0;
overflow:hidden;
clip:rect(0,0,0,0);
border:0
}
.sr-only-focusable:active,
.sr-only-focusable:focus {
position:static;
width:auto;
height:auto;
margin:0;
overflow:visible;
clip:auto
}
[role="button"] {
cursor:pointer
}
h1,
h2,
h3,
h4,
h5,
h6,
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
font-family:inherit;
line-height:1.1
}
h6,
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
font-weight:500
}
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
color:inherit
}
h1 small,
h2 small,
h3 small,
h4 small,
h5 small,
h6 small,
.h1 small,
.h2 small,
.h3 small,
.h4 small,
.h5 small,
.h6 small,
h1 .small,
h2 .small,
h3 .small,
h4 .small,
h5 .small,
h6 .small,
.h1 .small,
.h2 .small,
.h3 .small,
.h4 .small,
.h5 .small,
.h6 .small {
font-weight:400;
line-height:1;
color:#cdcdcd
}
.h1,
.h2,
.h3 {
margin-top:20px;
margin-bottom:10px
}
h1 small,
.h1 small,
h2 small,
.h2 small,
h3 small,
.h3 small,
h1 .small,
.h1 .small,
h2 .small,
.h2 .small,
h3 .small,
.h3 .small {
font-size:65%
}
.h4,
.h5,
.h6 {
margin-top:10px;
margin-bottom:10px
}
h4 small,
.h4 small,
h5 small,
.h5 small,
h6 small,
.h6 small,
h4 .small,
.h4 .small,
h5 .small,
.h5 .small,
h6 .small,
.h6 .small {
font-size:75%
}
.h1 {
font-size:36px
}
.h2 {
font-size:30px
}
.h3 {
font-size:24px
}
.h4 {
font-size:18px
}
.h5 {
font-size:14px
}
h6,
.h6 {
font-size:12px
}
p {
margin:0 0 10px
}
.lead {
margin-bottom:20px;
font-size:16px;
font-weight:300;
line-height:1.4
}
@media (min-width:768px) {
.lead {
 font-size:21px
}
}
small,
.small {
font-size:85%
}
mark,
.mark {
background-color:#fcf8e3;
padding:.2em
}
.text-left {
text-align:left
}
.text-right {
text-align:right
}
.text-center {
text-align:center
}
.text-justify {
text-align:justify
}
.text-nowrap {
white-space:nowrap
}
.text-lowercase {
text-transform:lowercase
}
.text-uppercase {
text-transform:uppercase
}
.text-capitalize {
text-transform:capitalize
}
.text-muted {
color:#cdcdcd
}
.text-primary {
color:#21366b
}
a.text-primary:hover,
a.text-primary:focus {
color:#152244
}
.text-success {
color:#3c763d
}
a.text-success:hover,
a.text-success:focus {
color:#2b542c
}
.text-info {
color:#31708f
}
a.text-info:hover,
a.text-info:focus {
color:#245269
}
.text-warning {
color:#8a6d3b
}
a.text-warning:hover,
a.text-warning:focus {
color:#66512c
}
.text-danger {
color:#a94442
}
a.text-danger:hover,
a.text-danger:focus {
color:#843534
}
.bg-primary {
color:#fff;
background-color:#21366b
}
a.bg-primary:hover,
a.bg-primary:focus {
background-color:#152244
}
.bg-success {
background-color:#dff0d8
}
a.bg-success:hover,
a.bg-success:focus {
background-color:#c1e2b3
}
.bg-info {
background-color:#d9edf7
}
a.bg-info:hover,
a.bg-info:focus {
background-color:#afd9ee
}
.bg-warning {
background-color:#fcf8e3
}
a.bg-warning:hover,
a.bg-warning:focus {
background-color:#f7ecb5
}
.bg-danger {
background-color:#f2dede
}
a.bg-danger:hover,
a.bg-danger:focus {
background-color:#e4b9b9
}
ul,
ol {
margin-top:0;
margin-bottom:10px
}
ul ul,
ol ul,
ul ol,
ol ol {
margin-bottom:0
}
.list-unstyled,
.list-inline {
padding-left:0;
list-style:none
}
.list-inline {
margin-left:-5px
}
.list-inline>li {
display:inline-block;
padding-left:5px;
padding-right:5px
}
dl {
margin-top:0;
margin-bottom:20px
}
dt,
dd {
line-height:1.42857143
}
dt {
font-weight:700
}
dd {
margin-left:0
}
@media (min-width:768px) {
.dl-horizontal dt {
 float:left;
 width:160px;
 clear:left;
 text-align:right;
 overflow:hidden;
 text-overflow:ellipsis;
 white-space:nowrap
}
.dl-horizontal dd {
 margin-left:180px
}
}
abbr[title],
abbr[data-original-title] {
cursor:help;
border-bottom:1px dotted #cdcdcd
}
.initialism {
font-size:90%;
text-transform:uppercase
}
blockquote {
padding:10px 20px;
margin:0 0 20px;
font-size:17.5px;
border-left:5px solid #dcdcdc
}
blockquote p:last-child,
blockquote ul:last-child,
blockquote ol:last-child {
margin-bottom:0
}
blockquote footer,
blockquote small,
blockquote .small {
display:block;
font-size:80%;
line-height:1.42857143;
color:#cdcdcd
}
blockquote footer:before,
blockquote small:before,
blockquote .small:before {
content:'\2014 \00A0'
}
.blockquote-reverse,
blockquote.pull-right {
padding-right:15px;
padding-left:0;
border-right:5px solid #dcdcdc;
border-left:0;
text-align:right
}
.blockquote-reverse footer:before,
blockquote.pull-right footer:before,
.blockquote-reverse small:before,
blockquote.pull-right small:before,
.blockquote-reverse .small:before,
blockquote.pull-right .small:before {
content:''
}
.blockquote-reverse footer:after,
blockquote.pull-right footer:after,
.blockquote-reverse small:after,
blockquote.pull-right small:after,
.blockquote-reverse .small:after,
blockquote.pull-right .small:after {
content:'\00A0 \2014'
}
address {
margin-bottom:20px;
font-style:normal;
line-height:1.42857143
}
code,
kbd,
pre,
samp {
font-family:Menlo,Monaco,Consolas,"Courier New",monospace
}
code {
color:#c7254e;
background-color:#f9f2f4;
border-radius:4px
}
code,
kbd {
padding:2px 4px;
font-size:90%
}
kbd {
color:#fff;
background-color:#333;
border-radius:3px;
box-shadow:inset 0 -1px 0 rgba(0,0,0,.25)
}
kbd kbd {
padding:0;
font-size:100%;
font-weight:700;
box-shadow:none
}
pre {
display:block;
padding:9.5px;
margin:0 0 10px;
font-size:13px;
line-height:1.42857143;
word-break:break-all;
word-wrap:break-word;
color:#333;
background-color:#f5f5f5;
border:1px solid #ccc;
border-radius:4px
}
pre code {
padding:0;
font-size:inherit;
color:inherit;
white-space:pre-wrap;
background-color:transparent;
border-radius:0
}
.pre-scrollable {
max-height:340px;
overflow-y:scroll
}
.container {
margin-right:auto;
margin-left:auto;
padding-left:15px;
padding-right:15px
}
@media (min-width:768px) {
.container {
 width:750px
}
}
@media (min-width:992px) {
.container {
 width:970px
}
}
@media (min-width:1200px) {
.container {
 width:1170px
}
}
.container-fluid {
margin-right:auto;
margin-left:auto;
padding-left:15px;
padding-right:15px
}
.row {
margin-left:-15px;
margin-right:-15px
}
.col-xs-1,
.col-sm-1,
.col-md-1,
.col-lg-1,
.col-xs-2,
.col-sm-2,
.col-md-2,
.col-lg-2,
.col-xs-3,
.col-sm-3,
.col-md-3,
.col-lg-3,
.col-xs-4,
.col-sm-4,
.col-md-4,
.col-lg-4,
.col-xs-5,
.col-sm-5,
.col-md-5,
.col-lg-5,
.col-xs-6,
.col-sm-6,
.col-md-6,
.col-lg-6,
.col-xs-7,
.col-sm-7,
.col-md-7,
.col-lg-7,
.col-xs-8,
.col-sm-8,
.col-md-8,
.col-lg-8,
.col-xs-9,
.col-sm-9,
.col-md-9,
.col-lg-9,
.col-xs-10,
.col-sm-10,
.col-md-10,
.col-lg-10,
.col-xs-11,
.col-sm-11,
.col-md-11,
.col-lg-11,
.col-xs-12,
.col-sm-12,
.col-md-12,
.col-lg-12 {
position:relative;
min-height:1px;
padding-left:15px;
padding-right:15px
}
.col-xs-1,
.col-xs-2,
.col-xs-3,
.col-xs-4,
.col-xs-5,
.col-xs-6,
.col-xs-7,
.col-xs-8,
.col-xs-9,
.col-xs-10,
.col-xs-11 {
float:left
}
.col-xs-12 {
float:left;
width:100%
}
.col-xs-11 {
width:91.66666667%
}
.col-xs-10 {
width:83.33333333%
}
.col-xs-9 {
width:75%
}
.col-xs-8 {
width:66.66666667%
}
.col-xs-7 {
width:58.33333333%
}
.col-xs-6 {
width:50%
}
.col-xs-5 {
width:41.66666667%
}
.col-xs-4 {
width:33.33333333%
}
.col-xs-3 {
width:25%
}
.col-xs-2 {
width:16.66666667%
}
.col-xs-1 {
width:8.33333333%
}
.col-xs-pull-12 {
right:100%
}
.col-xs-pull-11 {
right:91.66666667%
}
.col-xs-pull-10 {
right:83.33333333%
}
.col-xs-pull-9 {
right:75%
}
.col-xs-pull-8 {
right:66.66666667%
}
.col-xs-pull-7 {
right:58.33333333%
}
.col-xs-pull-6 {
right:50%
}
.col-xs-pull-5 {
right:41.66666667%
}
.col-xs-pull-4 {
right:33.33333333%
}
.col-xs-pull-3 {
right:25%
}
.col-xs-pull-2 {
right:16.66666667%
}
.col-xs-pull-1 {
right:8.33333333%
}
.col-xs-pull-0 {
right:auto
}
.col-xs-push-12 {
left:100%
}
.col-xs-push-11 {
left:91.66666667%
}
.col-xs-push-10 {
left:83.33333333%
}
.col-xs-push-9 {
left:75%
}
.col-xs-push-8 {
left:66.66666667%
}
.col-xs-push-7 {
left:58.33333333%
}
.col-xs-push-6 {
left:50%
}
.col-xs-push-5 {
left:41.66666667%
}
.col-xs-push-4 {
left:33.33333333%
}
.col-xs-push-3 {
left:25%
}
.col-xs-push-2 {
left:16.66666667%
}
.col-xs-push-1 {
left:8.33333333%
}
.col-xs-push-0 {
left:auto
}
.col-xs-offset-12 {
margin-left:100%
}
.col-xs-offset-11 {
margin-left:91.66666667%
}
.col-xs-offset-10 {
margin-left:83.33333333%
}
.col-xs-offset-9 {
margin-left:75%
}
.col-xs-offset-8 {
margin-left:66.66666667%
}
.col-xs-offset-7 {
margin-left:58.33333333%
}
.col-xs-offset-6 {
margin-left:50%
}
.col-xs-offset-5 {
margin-left:41.66666667%
}
.col-xs-offset-4 {
margin-left:33.33333333%
}
.col-xs-offset-3 {
margin-left:25%
}
.col-xs-offset-2 {
margin-left:16.66666667%
}
.col-xs-offset-1 {
margin-left:8.33333333%
}
.col-xs-offset-0 {
margin-left:0%
}
@media (min-width:768px) {
.col-sm-1,
.col-sm-2,
.col-sm-3,
.col-sm-4,
.col-sm-5,
.col-sm-6,
.col-sm-7,
.col-sm-8,
.col-sm-9,
.col-sm-10,
.col-sm-11 {
 float:left
}
.col-sm-12 {
 float:left;
 width:100%
}
.col-sm-11 {
 width:91.66666667%
}
.col-sm-10 {
 width:83.33333333%
}
.col-sm-9 {
 width:75%
}
.col-sm-8 {
 width:66.66666667%
}
.col-sm-7 {
 width:58.33333333%
}
.col-sm-6 {
 width:50%
}
.col-sm-5 {
 width:41.66666667%
}
.col-sm-4 {
 width:33.33333333%
}
.col-sm-3 {
 width:25%
}
.col-sm-2 {
 width:16.66666667%
}
.col-sm-1 {
 width:8.33333333%
}
.col-sm-pull-12 {
 right:100%
}
.col-sm-pull-11 {
 right:91.66666667%
}
.col-sm-pull-10 {
 right:83.33333333%
}
.col-sm-pull-9 {
 right:75%
}
.col-sm-pull-8 {
 right:66.66666667%
}
.col-sm-pull-7 {
 right:58.33333333%
}
.col-sm-pull-6 {
 right:50%
}
.col-sm-pull-5 {
 right:41.66666667%
}
.col-sm-pull-4 {
 right:33.33333333%
}
.col-sm-pull-3 {
 right:25%
}
.col-sm-pull-2 {
 right:16.66666667%
}
.col-sm-pull-1 {
 right:8.33333333%
}
.col-sm-pull-0 {
 right:auto
}
.col-sm-push-12 {
 left:100%
}
.col-sm-push-11 {
 left:91.66666667%
}
.col-sm-push-10 {
 left:83.33333333%
}
.col-sm-push-9 {
 left:75%
}
.col-sm-push-8 {
 left:66.66666667%
}
.col-sm-push-7 {
 left:58.33333333%
}
.col-sm-push-6 {
 left:50%
}
.col-sm-push-5 {
 left:41.66666667%
}
.col-sm-push-4 {
 left:33.33333333%
}
.col-sm-push-3 {
 left:25%
}
.col-sm-push-2 {
 left:16.66666667%
}
.col-sm-push-1 {
 left:8.33333333%
}
.col-sm-push-0 {
 left:auto
}
.col-sm-offset-12 {
 margin-left:100%
}
.col-sm-offset-11 {
 margin-left:91.66666667%
}
.col-sm-offset-10 {
 margin-left:83.33333333%
}
.col-sm-offset-9 {
 margin-left:75%
}
.col-sm-offset-8 {
 margin-left:66.66666667%
}
.col-sm-offset-7 {
 margin-left:58.33333333%
}
.col-sm-offset-6 {
 margin-left:50%
}
.col-sm-offset-5 {
 margin-left:41.66666667%
}
.col-sm-offset-4 {
 margin-left:33.33333333%
}
.col-sm-offset-3 {
 margin-left:25%
}
.col-sm-offset-2 {
 margin-left:16.66666667%
}
.col-sm-offset-1 {
 margin-left:8.33333333%
}
.col-sm-offset-0 {
 margin-left:0%
}
}
@media (min-width:992px) {
.col-md-1,
.col-md-2,
.col-md-3,
.col-md-4,
.col-md-5,
.col-md-6,
.col-md-7,
.col-md-8,
.col-md-9,
.col-md-10,
.col-md-11 {
 float:left
}
.col-md-12 {
 float:left;
 width:100%
}
.col-md-11 {
 width:91.66666667%
}
.col-md-10 {
 width:83.33333333%
}
.col-md-9 {
 width:75%
}
.col-md-8 {
 width:66.66666667%
}
.col-md-7 {
 width:58.33333333%
}
.col-md-6 {
 width:50%
}
.col-md-5 {
 width:41.66666667%
}
.col-md-4 {
 width:33.33333333%
}
.col-md-3 {
 width:25%
}
.col-md-2 {
 width:16.66666667%
}
.col-md-1 {
 width:8.33333333%
}
.col-md-pull-12 {
 right:100%
}
.col-md-pull-11 {
 right:91.66666667%
}
.col-md-pull-10 {
 right:83.33333333%
}
.col-md-pull-9 {
 right:75%
}
.col-md-pull-8 {
 right:66.66666667%
}
.col-md-pull-7 {
 right:58.33333333%
}
.col-md-pull-6 {
 right:50%
}
.col-md-pull-5 {
 right:41.66666667%
}
.col-md-pull-4 {
 right:33.33333333%
}
.col-md-pull-3 {
 right:25%
}
.col-md-pull-2 {
 right:16.66666667%
}
.col-md-pull-1 {
 right:8.33333333%
}
.col-md-pull-0 {
 right:auto
}
.col-md-push-12 {
 left:100%
}
.col-md-push-11 {
 left:91.66666667%
}
.col-md-push-10 {
 left:83.33333333%
}
.col-md-push-9 {
 left:75%
}
.col-md-push-8 {
 left:66.66666667%
}
.col-md-push-7 {
 left:58.33333333%
}
.col-md-push-6 {
 left:50%
}
.col-md-push-5 {
 left:41.66666667%
}
.col-md-push-4 {
 left:33.33333333%
}
.col-md-push-3 {
 left:25%
}
.col-md-push-2 {
 left:16.66666667%
}
.col-md-push-1 {
 left:8.33333333%
}
.col-md-push-0 {
 left:auto
}
.col-md-offset-12 {
 margin-left:100%
}
.col-md-offset-11 {
 margin-left:91.66666667%
}
.col-md-offset-10 {
 margin-left:83.33333333%
}
.col-md-offset-9 {
 margin-left:75%
}
.col-md-offset-8 {
 margin-left:66.66666667%
}
.col-md-offset-7 {
 margin-left:58.33333333%
}
.col-md-offset-6 {
 margin-left:50%
}
.col-md-offset-5 {
 margin-left:41.66666667%
}
.col-md-offset-4 {
 margin-left:33.33333333%
}
.col-md-offset-3 {
 margin-left:25%
}
.col-md-offset-2 {
 margin-left:16.66666667%
}
.col-md-offset-1 {
 margin-left:8.33333333%
}
.col-md-offset-0 {
 margin-left:0%
}
}
@media (min-width:1200px) {
.col-lg-1,
.col-lg-2,
.col-lg-3,
.col-lg-4,
.col-lg-5,
.col-lg-6,
.col-lg-7,
.col-lg-8,
.col-lg-9,
.col-lg-10,
.col-lg-11 {
 float:left
}
.col-lg-12 {
 float:left;
 width:100%
}
.col-lg-11 {
 width:91.66666667%
}
.col-lg-10 {
 width:83.33333333%
}
.col-lg-9 {
 width:75%
}
.col-lg-8 {
 width:66.66666667%
}
.col-lg-7 {
 width:58.33333333%
}
.col-lg-6 {
 width:50%
}
.col-lg-5 {
 width:41.66666667%
}
.col-lg-4 {
 width:33.33333333%
}
.col-lg-3 {
 width:25%
}
.col-lg-2 {
 width:16.66666667%
}
.col-lg-1 {
 width:8.33333333%
}
.col-lg-pull-12 {
 right:100%
}
.col-lg-pull-11 {
 right:91.66666667%
}
.col-lg-pull-10 {
 right:83.33333333%
}
.col-lg-pull-9 {
 right:75%
}
.col-lg-pull-8 {
 right:66.66666667%
}
.col-lg-pull-7 {
 right:58.33333333%
}
.col-lg-pull-6 {
 right:50%
}
.col-lg-pull-5 {
 right:41.66666667%
}
.col-lg-pull-4 {
 right:33.33333333%
}
.col-lg-pull-3 {
 right:25%
}
.col-lg-pull-2 {
 right:16.66666667%
}
.col-lg-pull-1 {
 right:8.33333333%
}
.col-lg-pull-0 {
 right:auto
}
.col-lg-push-12 {
 left:100%
}
.col-lg-push-11 {
 left:91.66666667%
}
.col-lg-push-10 {
 left:83.33333333%
}
.col-lg-push-9 {
 left:75%
}
.col-lg-push-8 {
 left:66.66666667%
}
.col-lg-push-7 {
 left:58.33333333%
}
.col-lg-push-6 {
 left:50%
}
.col-lg-push-5 {
 left:41.66666667%
}
.col-lg-push-4 {
 left:33.33333333%
}
.col-lg-push-3 {
 left:25%
}
.col-lg-push-2 {
 left:16.66666667%
}
.col-lg-push-1 {
 left:8.33333333%
}
.col-lg-push-0 {
 left:auto
}
.col-lg-offset-12 {
 margin-left:100%
}
.col-lg-offset-11 {
 margin-left:91.66666667%
}
.col-lg-offset-10 {
 margin-left:83.33333333%
}
.col-lg-offset-9 {
 margin-left:75%
}
.col-lg-offset-8 {
 margin-left:66.66666667%
}
.col-lg-offset-7 {
 margin-left:58.33333333%
}
.col-lg-offset-6 {
 margin-left:50%
}
.col-lg-offset-5 {
 margin-left:41.66666667%
}
.col-lg-offset-4 {
 margin-left:33.33333333%
}
.col-lg-offset-3 {
 margin-left:25%
}
.col-lg-offset-2 {
 margin-left:16.66666667%
}
.col-lg-offset-1 {
 margin-left:8.33333333%
}
.col-lg-offset-0 {
 margin-left:0%
}
}
table {
background-color:transparent
}
caption {
padding-top:8px;
padding-bottom:8px;
color:#cdcdcd
}
caption,
th {
text-align:left
}
.table {
width:100%;
max-width:100%;
margin-bottom:20px
}
.table>thead>tr>th {
padding:8px;
line-height:1.42857143;
border-top:1px solid #ddd
}
.table>tbody>tr>th,
.table>tfoot>tr>th,
.table>thead>tr>td,
.table>tbody>tr>td,
.table>tfoot>tr>td {
padding:8px;
line-height:1.42857143;
vertical-align:top;
border-top:1px solid #ddd
}
.table>thead>tr>th {
vertical-align:bottom;
border-bottom:2px solid #ddd
}
.table>caption+thead>tr:first-child>th,
.table>colgroup+thead>tr:first-child>th,
.table>thead:first-child>tr:first-child>th,
.table>caption+thead>tr:first-child>td,
.table>colgroup+thead>tr:first-child>td,
.table>thead:first-child>tr:first-child>td {
border-top:0
}
.table>tbody+tbody {
border-top:2px solid #ddd
}
.table .table {
background-color:#fff
}
.table-condensed>thead>tr>th,
.table-condensed>tbody>tr>th,
.table-condensed>tfoot>tr>th,
.table-condensed>thead>tr>td,
.table-condensed>tbody>tr>td,
.table-condensed>tfoot>tr>td {
padding:5px
}
.table-bordered,
.table-bordered>thead>tr>th,
.table-bordered>tbody>tr>th,
.table-bordered>tfoot>tr>th,
.table-bordered>thead>tr>td,
.table-bordered>tbody>tr>td,
.table-bordered>tfoot>tr>td {
border:1px solid #ddd
}
.table-bordered>thead>tr>th,
.table-bordered>thead>tr>td {
border-bottom-width:2px
}
.table-striped>tbody>tr:nth-of-type(odd) {
background-color:#f9f9f9
}
.table-hover>tbody>tr:hover {
background-color:#f5f5f5
}
table col[class*="col-"] {
position:static;
float:none;
display:table-column
}
table td[class*="col-"],
table th[class*="col-"] {
position:static;
float:none;
display:table-cell
}
.table>thead>tr>td.active,
.table>tbody>tr>td.active,
.table>tfoot>tr>td.active,
.table>thead>tr>th.active,
.table>tbody>tr>th.active,
.table>tfoot>tr>th.active,
.table>thead>tr.active>td,
.table>tbody>tr.active>td,
.table>tfoot>tr.active>td,
.table>thead>tr.active>th,
.table>tbody>tr.active>th,
.table>tfoot>tr.active>th {
background-color:#f5f5f5
}
.table-hover>tbody>tr>td.active:hover,
.table-hover>tbody>tr>th.active:hover,
.table-hover>tbody>tr.active:hover>td,
.table-hover>tbody>tr:hover>.active,
.table-hover>tbody>tr.active:hover>th {
background-color:#e8e8e8
}
.table>thead>tr>td.success,
.table>tbody>tr>td.success,
.table>tfoot>tr>td.success,
.table>thead>tr>th.success,
.table>tbody>tr>th.success,
.table>tfoot>tr>th.success,
.table>thead>tr.success>td,
.table>tbody>tr.success>td,
.table>tfoot>tr.success>td,
.table>thead>tr.success>th,
.table>tbody>tr.success>th,
.table>tfoot>tr.success>th {
background-color:#dff0d8
}
.table-hover>tbody>tr>td.success:hover,
.table-hover>tbody>tr>th.success:hover,
.table-hover>tbody>tr.success:hover>td,
.table-hover>tbody>tr:hover>.success,
.table-hover>tbody>tr.success:hover>th {
background-color:#d0e9c6
}
.table>thead>tr>td.info,
.table>tbody>tr>td.info,
.table>tfoot>tr>td.info,
.table>thead>tr>th.info,
.table>tbody>tr>th.info,
.table>tfoot>tr>th.info,
.table>thead>tr.info>td,
.table>tbody>tr.info>td,
.table>tfoot>tr.info>td,
.table>thead>tr.info>th,
.table>tbody>tr.info>th,
.table>tfoot>tr.info>th {
background-color:#d9edf7
}
.table-hover>tbody>tr>td.info:hover,
.table-hover>tbody>tr>th.info:hover,
.table-hover>tbody>tr.info:hover>td,
.table-hover>tbody>tr:hover>.info,
.table-hover>tbody>tr.info:hover>th {
background-color:#c4e3f3
}
.table>thead>tr>td.warning,
.table>tbody>tr>td.warning,
.table>tfoot>tr>td.warning,
.table>thead>tr>th.warning,
.table>tbody>tr>th.warning,
.table>tfoot>tr>th.warning,
.table>thead>tr.warning>td,
.table>tbody>tr.warning>td,
.table>tfoot>tr.warning>td,
.table>thead>tr.warning>th,
.table>tbody>tr.warning>th,
.table>tfoot>tr.warning>th {
background-color:#fcf8e3
}
.table-hover>tbody>tr>td.warning:hover,
.table-hover>tbody>tr>th.warning:hover,
.table-hover>tbody>tr.warning:hover>td,
.table-hover>tbody>tr:hover>.warning,
.table-hover>tbody>tr.warning:hover>th {
background-color:#faf2cc
}
.table>thead>tr>td.danger,
.table>tbody>tr>td.danger,
.table>tfoot>tr>td.danger,
.table>thead>tr>th.danger,
.table>tbody>tr>th.danger,
.table>tfoot>tr>th.danger,
.table>thead>tr.danger>td,
.table>tbody>tr.danger>td,
.table>tfoot>tr.danger>td,
.table>thead>tr.danger>th,
.table>tbody>tr.danger>th,
.table>tfoot>tr.danger>th {
background-color:#f2dede
}
.table-hover>tbody>tr>td.danger:hover,
.table-hover>tbody>tr>th.danger:hover,
.table-hover>tbody>tr.danger:hover>td,
.table-hover>tbody>tr:hover>.danger,
.table-hover>tbody>tr.danger:hover>th {
background-color:#ebcccc
}
.table-responsive {
overflow-x:auto;
min-height:.01%
}
@media screen and (max-width:767px) {
.table-responsive {
 width:100%;
 margin-bottom:15px;
 overflow-y:hidden;
 -ms-overflow-style:-ms-autohiding-scrollbar;
 border:1px solid #ddd
}
.table-responsive>.table {
 margin-bottom:0
}
.table-responsive>.table>thead>tr>th,
.table-responsive>.table>tbody>tr>th,
.table-responsive>.table>tfoot>tr>th,
.table-responsive>.table>thead>tr>td,
.table-responsive>.table>tbody>tr>td,
.table-responsive>.table>tfoot>tr>td {
 white-space:nowrap
}
.table-responsive>.table-bordered {
 border:0
}
.table-responsive>.table-bordered>thead>tr>th:first-child,
.table-responsive>.table-bordered>tbody>tr>th:first-child,
.table-responsive>.table-bordered>tfoot>tr>th:first-child,
.table-responsive>.table-bordered>thead>tr>td:first-child,
.table-responsive>.table-bordered>tbody>tr>td:first-child,
.table-responsive>.table-bordered>tfoot>tr>td:first-child {
 border-left:0
}
.table-responsive>.table-bordered>thead>tr>th:last-child,
.table-responsive>.table-bordered>tbody>tr>th:last-child,
.table-responsive>.table-bordered>tfoot>tr>th:last-child,
.table-responsive>.table-bordered>thead>tr>td:last-child,
.table-responsive>.table-bordered>tbody>tr>td:last-child,
.table-responsive>.table-bordered>tfoot>tr>td:last-child {
 border-right:0
}
.table-responsive>.table-bordered>tbody>tr:last-child>th,
.table-responsive>.table-bordered>tfoot>tr:last-child>th,
.table-responsive>.table-bordered>tbody>tr:last-child>td,
.table-responsive>.table-bordered>tfoot>tr:last-child>td {
 border-bottom:0
}
}
fieldset {
padding:0;
margin:0;
border:0;
min-width:0
}
legend {
display:block;
width:100%;
padding:0;
margin-bottom:20px;
font-size:21px;
line-height:inherit;
color:#333;
border:0;
border-bottom:1px solid #e5e5e5
}
label {
display:inline-block;
max-width:100%;
margin-bottom:5px;
font-weight:700
}
input[type="search"] {
-webkit-box-sizing:border-box;
-moz-box-sizing:border-box;
box-sizing:border-box
}
input[type="radio"],
input[type="checkbox"] {
margin:4px 0 0;
margin-top:1px \9;
line-height:normal
}
input[type="file"] {
display:block
}
input[type="range"] {
display:block;
width:100%
}
select[multiple],
select[size] {
height:auto
}
input[type="file"]:focus,
input[type="radio"]:focus,
input[type="checkbox"]:focus {
outline:thin dotted;
outline:5px auto -webkit-focus-ring-color;
outline-offset:-2px
}
output {
padding-top:7px
}
output,
.form-control {
display:block;
font-size:14px;
line-height:1.42857143;
color:#555
}
.form-control {
width:100%;
height:34px;
padding:6px 12px;
background-color:#fff;
background-image:none;
border:1px solid #ccc;
border-radius:4px;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
-webkit-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;
-o-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;
transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s
}
.form-control:focus {
border-color:#66afe9;
outline:0;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);
box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)
}
.form-control::-moz-placeholder {
color:#999;
opacity:1
}
.form-control:-ms-input-placeholder {
color:#999
}
.form-control::-webkit-input-placeholder {
color:#999
}
.form-control[disabled],
.form-control[readonly],
fieldset[disabled] .form-control {
background-color:#dcdcdc;
opacity:1
}
.form-control[disabled],
fieldset[disabled] .form-control {
cursor:not-allowed
}
textarea.form-control {
height:auto
}
input[type="search"] {
-webkit-appearance:none
}
@media screen and (-webkit-min-device-pixel-ratio:0) {
input[type="date"].form-control,
input[type="time"].form-control,
input[type="datetime-local"].form-control,
input[type="month"].form-control {
 line-height:34px
}
input[type="date"].input-sm,
input[type="time"].input-sm,
input[type="datetime-local"].input-sm,
input[type="month"].input-sm,
.input-group-sm input[type="date"],
.input-group-sm input[type="time"],
.input-group-sm input[type="datetime-local"],
.input-group-sm input[type="month"] {
 line-height:30px
}
input[type="date"].input-lg,
input[type="time"].input-lg,
input[type="datetime-local"].input-lg,
input[type="month"].input-lg,
.input-group-lg input[type="date"],
.input-group-lg input[type="time"],
.input-group-lg input[type="datetime-local"],
.input-group-lg input[type="month"] {
 line-height:46px
}
}
.form-group {
margin-bottom:15px
}
.radio,
.checkbox {
position:relative;
display:block;
margin-top:10px;
margin-bottom:10px
}
.radio label,
.checkbox label {
min-height:20px;
padding-left:20px;
margin-bottom:0;
font-weight:400;
cursor:pointer
}
.radio input[type="radio"],
.radio-inline input[type="radio"],
.checkbox input[type="checkbox"],
.checkbox-inline input[type="checkbox"] {
position:absolute;
margin-left:-20px;
margin-top:4px \9
}
.radio+.radio,
.checkbox+.checkbox {
margin-top:-5px
}
.radio-inline,
.checkbox-inline {
position:relative;
display:inline-block;
padding-left:20px;
margin-bottom:0;
vertical-align:middle;
font-weight:400;
cursor:pointer
}
.radio-inline+.radio-inline,
.checkbox-inline+.checkbox-inline {
margin-top:0;
margin-left:10px
}
input[type="radio"][disabled],
input[type="checkbox"][disabled],
input[type="radio"].disabled,
input[type="checkbox"].disabled,
fieldset[disabled] input[type="radio"],
fieldset[disabled] input[type="checkbox"],
.radio-inline.disabled,
.checkbox-inline.disabled,
fieldset[disabled] .radio-inline,
fieldset[disabled] .checkbox-inline,
.radio.disabled label,
.checkbox.disabled label,
fieldset[disabled] .radio label,
fieldset[disabled] .checkbox label {
cursor:not-allowed
}
.form-control-static {
padding-top:7px;
padding-bottom:7px;
margin-bottom:0;
min-height:34px
}
.form-control-static.input-lg,
.form-control-static.input-sm {
padding-left:0;
padding-right:0
}
.input-sm {
height:30px;
padding:5px 10px;
font-size:12px;
line-height:1.5;
border-radius:3px
}
select.input-sm {
height:30px;
line-height:30px
}
textarea.input-sm,
select[multiple].input-sm {
height:auto
}
.form-group-sm .form-control {
height:30px;
padding:5px 10px;
font-size:12px;
line-height:1.5;
border-radius:3px
}
.form-group-sm select.form-control {
height:30px;
line-height:30px
}
.form-group-sm textarea.form-control,
.form-group-sm select[multiple].form-control {
height:auto
}
.form-group-sm .form-control-static {
height:30px;
min-height:32px;
padding:6px 10px;
font-size:12px;
line-height:1.5
}
.input-lg {
height:46px;
padding:10px 16px;
font-size:18px;
line-height:1.3333333;
border-radius:6px
}
select.input-lg {
height:46px;
line-height:46px
}
textarea.input-lg,
select[multiple].input-lg {
height:auto
}
.form-group-lg .form-control {
height:46px;
padding:10px 16px;
font-size:18px;
line-height:1.3333333;
border-radius:6px
}
.form-group-lg select.form-control {
height:46px;
line-height:46px
}
.form-group-lg textarea.form-control,
.form-group-lg select[multiple].form-control {
height:auto
}
.form-group-lg .form-control-static {
height:46px;
min-height:38px;
padding:11px 16px;
font-size:18px;
line-height:1.3333333
}
.has-feedback {
position:relative
}
.has-feedback .form-control {
padding-right:42.5px
}
.form-control-feedback {
position:absolute;
top:0;
right:0;
z-index:2;
display:block;
width:34px;
height:34px;
line-height:34px;
text-align:center;
pointer-events:none
}
.input-lg+.form-control-feedback,
.input-group-lg+.form-control-feedback,
.form-group-lg .form-control+.form-control-feedback {
width:46px;
height:46px;
line-height:46px
}
.input-sm+.form-control-feedback,
.input-group-sm+.form-control-feedback,
.form-group-sm .form-control+.form-control-feedback {
width:30px;
height:30px;
line-height:30px
}
.has-success .help-block,
.has-success .control-label,
.has-success .radio,
.has-success .checkbox,
.has-success .radio-inline,
.has-success .checkbox-inline,
.has-success.radio label,
.has-success.checkbox label,
.has-success.radio-inline label,
.has-success.checkbox-inline label {
color:#3c763d
}
.has-success .form-control {
border-color:#3c763d;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
box-shadow:inset 0 1px 1px rgba(0,0,0,.075)
}
.has-success .form-control:focus {
border-color:#2b542c;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #67b168;
box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #67b168
}
.has-success .input-group-addon {
color:#3c763d;
border-color:#3c763d;
background-color:#dff0d8
}
.has-success .form-control-feedback {
color:#3c763d
}
.has-warning .help-block,
.has-warning .control-label,
.has-warning .radio,
.has-warning .checkbox,
.has-warning .radio-inline,
.has-warning .checkbox-inline,
.has-warning.radio label,
.has-warning.checkbox label,
.has-warning.radio-inline label,
.has-warning.checkbox-inline label {
color:#8a6d3b
}
.has-warning .form-control {
border-color:#8a6d3b;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
box-shadow:inset 0 1px 1px rgba(0,0,0,.075)
}
.has-warning .form-control:focus {
border-color:#66512c;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #c0a16b;
box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #c0a16b
}
.has-warning .input-group-addon {
color:#8a6d3b;
border-color:#8a6d3b;
background-color:#fcf8e3
}
.has-warning .form-control-feedback {
color:#8a6d3b
}
.has-error .help-block,
.has-error .control-label,
.has-error .radio,
.has-error .checkbox,
.has-error .radio-inline,
.has-error .checkbox-inline,
.has-error.radio label,
.has-error.checkbox label,
.has-error.radio-inline label,
.has-error.checkbox-inline label {
color:#a94442
}
.has-error .form-control {
border-color:#a94442;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
box-shadow:inset 0 1px 1px rgba(0,0,0,.075)
}
.has-error .form-control:focus {
border-color:#843534;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #ce8483;
box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #ce8483
}
.has-error .input-group-addon {
color:#a94442;
border-color:#a94442;
background-color:#f2dede
}
.has-error .form-control-feedback {
color:#a94442
}
.has-feedback label~.form-control-feedback {
top:25px
}
.has-feedback label.sr-only~.form-control-feedback {
top:0
}
.help-block {
display:block;
margin-top:5px;
margin-bottom:10px;
color:#737373
}
@media (min-width:768px) {
.form-inline .form-group {
 display:inline-block;
 margin-bottom:0;
 vertical-align:middle
}
.form-inline .form-control {
 display:inline-block;
 width:auto;
 vertical-align:middle
}
.form-inline .form-control-static {
 display:inline-block
}
.form-inline .input-group {
 display:inline-table;
 vertical-align:middle
}
.form-inline .input-group .input-group-addon,
.form-inline .input-group .input-group-btn,
.form-inline .input-group .form-control {
 width:auto
}
.form-inline .input-group>.form-control {
 width:100%
}
.form-inline .control-label {
 margin-bottom:0;
 vertical-align:middle
}
.form-inline .radio,
.form-inline .checkbox {
 display:inline-block;
 margin-top:0;
 margin-bottom:0;
 vertical-align:middle
}
.form-inline .radio label,
.form-inline .checkbox label {
 padding-left:0
}
.form-inline .radio input[type="radio"],
.form-inline .checkbox input[type="checkbox"] {
 position:relative;
 margin-left:0
}
.form-inline .has-feedback .form-control-feedback {
 top:0
}
}
.form-horizontal .radio,
.form-horizontal .checkbox,
.form-horizontal .radio-inline,
.form-horizontal .checkbox-inline {
margin-top:0;
margin-bottom:0;
padding-top:7px
}
.form-horizontal .radio,
.form-horizontal .checkbox {
min-height:27px
}
.form-horizontal .form-group {
margin-left:-15px;
margin-right:-15px
}
@media (min-width:768px) {
.form-horizontal .control-label {
 text-align:right;
 margin-bottom:0;
 padding-top:7px
}
}
.form-horizontal .has-feedback .form-control-feedback {
right:15px
}
@media (min-width:768px) {
.form-horizontal .form-group-lg .control-label {
 padding-top:14.333333px;
 font-size:18px
}
}
@media (min-width:768px) {
.form-horizontal .form-group-sm .control-label {
 padding-top:6px;
 font-size:12px
}
}
.btn {
display:inline-block;
margin-bottom:0;
text-align:center;
touch-action:manipulation;
cursor:pointer;
background-image:none;
white-space:nowrap;
font-size:14px;
line-height:1.42857143;
border-radius:4px;
-webkit-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none
}
.btn:focus,
.btn:active:focus,
.btn.active:focus,
.btn.focus,
.btn:active.focus,
.btn.active.focus {
outline:thin dotted;
outline:5px auto -webkit-focus-ring-color;
outline-offset:-2px
}
.btn:hover {
text-decoration:none
}
.btn:focus,
.btn.focus {
color:#333;
text-decoration:none
}
.btn:active,
.btn.active {
outline:0;
background-image:none;
-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,.125);
box-shadow:inset 0 3px 5px rgba(0,0,0,.125)
}
.btn.disabled,
.btn[disabled],
fieldset[disabled] .btn {
cursor:not-allowed;
opacity:.65;
filter:alpha(opacity=65);
-webkit-box-shadow:none;
box-shadow:none
}
a.btn.disabled,
fieldset[disabled] a.btn {
pointer-events:none
}
.btn-default {
color:#333;
background-color:#fff;
border-color:#ccc
}
.btn-default:focus,
.btn-default.focus {
color:#333;
background-color:#e6e6e6;
border-color:#8c8c8c
}
.btn-default:hover {
color:#333;
background-color:#e6e6e6;
border-color:#adadad
}
.btn-default:active,
.btn-default.active,
.open>.dropdown-toggle.btn-default {
color:#333;
background-color:#e6e6e6;
border-color:#adadad
}
.btn-default:active:hover,
.btn-default.active:hover,
.open>.dropdown-toggle.btn-default:hover,
.btn-default:active:focus,
.btn-default.active:focus,
.open>.dropdown-toggle.btn-default:focus,
.btn-default:active.focus,
.btn-default.active.focus,
.open>.dropdown-toggle.btn-default.focus {
color:#333;
background-color:#d4d4d4;
border-color:#8c8c8c
}
.btn-default:active,
.btn-default.active,
.open>.dropdown-toggle.btn-default {
background-image:none
}
.btn-default.disabled,
.btn-default[disabled],
fieldset[disabled] .btn-default,
.btn-default.disabled:hover,
.btn-default[disabled]:hover,
fieldset[disabled] .btn-default:hover,
.btn-default.disabled:focus,
.btn-default[disabled]:focus,
fieldset[disabled] .btn-default:focus,
.btn-default.disabled.focus,
.btn-default[disabled].focus,
fieldset[disabled] .btn-default.focus,
.btn-default.disabled:active,
.btn-default[disabled]:active,
fieldset[disabled] .btn-default:active,
.btn-default.disabled.active,
.btn-default[disabled].active,
fieldset[disabled] .btn-default.active {
background-color:#fff;
border-color:#ccc
}
.btn-default .badge {
color:#fff;
background-color:#333
}
.btn-primary:focus,
.btn-primary.focus {
color:#fff;
background-color:#152244;
border-color:#000
}
.btn-primary:hover {
color:#fff;
background-color:#152244;
border-color:#0d1529
}
.btn-primary:active,
.btn-primary.active,
.open>.dropdown-toggle.btn-primary {
color:#fff;
background-color:#152244;
border-color:#0d1529
}
.btn-primary:active:hover,
.btn-primary.active:hover,
.open>.dropdown-toggle.btn-primary:hover,
.btn-primary:active:focus,
.btn-primary.active:focus,
.open>.dropdown-toggle.btn-primary:focus,
.btn-primary:active.focus,
.btn-primary.active.focus,
.open>.dropdown-toggle.btn-primary.focus {
color:#fff;
background-color:#0d1529;
border-color:#000
}
.btn-primary:active,
.btn-primary.active,
.open>.dropdown-toggle.btn-primary {
background-image:none
}
.btn-primary.disabled,
.btn-primary[disabled],
fieldset[disabled] .btn-primary,
.btn-primary.disabled:hover,
.btn-primary[disabled]:hover,
fieldset[disabled] .btn-primary:hover {
border-color:#1b2c58
}
.btn-primary.disabled:focus,
.btn-primary[disabled]:focus,
fieldset[disabled] .btn-primary:focus,
.btn-primary.disabled.focus,
.btn-primary[disabled].focus,
fieldset[disabled] .btn-primary.focus {
background-color:#21366b;
border-color:#1b2c58
}
.btn-primary.disabled:active,
.btn-primary[disabled]:active,
fieldset[disabled] .btn-primary:active,
.btn-primary.disabled.active,
.btn-primary[disabled].active,
fieldset[disabled] .btn-primary.active {
border-color:#1b2c58
}
.btn-primary .badge {
color:#21366b;
background-color:#fff
}
.btn-success {
color:#fff;
background-color:#5cb85c;
border-color:#4cae4c
}
.btn-success:focus,
.btn-success.focus {
color:#fff;
background-color:#449d44;
border-color:#255625
}
.btn-success:hover {
color:#fff;
background-color:#449d44;
border-color:#398439
}
.btn-success:active,
.btn-success.active,
.open>.dropdown-toggle.btn-success {
color:#fff;
background-color:#449d44;
border-color:#398439
}
.btn-success:active:hover,
.btn-success.active:hover,
.open>.dropdown-toggle.btn-success:hover,
.btn-success:active:focus,
.btn-success.active:focus,
.open>.dropdown-toggle.btn-success:focus,
.btn-success:active.focus,
.btn-success.active.focus,
.open>.dropdown-toggle.btn-success.focus {
color:#fff;
background-color:#398439;
border-color:#255625
}
.btn-success:active,
.btn-success.active,
.open>.dropdown-toggle.btn-success {
background-image:none
}
.btn-success.disabled,
.btn-success[disabled],
fieldset[disabled] .btn-success,
.btn-success.disabled:hover,
.btn-success[disabled]:hover,
fieldset[disabled] .btn-success:hover,
.btn-success.disabled:focus,
.btn-success[disabled]:focus,
fieldset[disabled] .btn-success:focus,
.btn-success.disabled.focus,
.btn-success[disabled].focus,
fieldset[disabled] .btn-success.focus,
.btn-success.disabled:active,
.btn-success[disabled]:active,
fieldset[disabled] .btn-success:active,
.btn-success.disabled.active,
.btn-success[disabled].active,
fieldset[disabled] .btn-success.active {
background-color:#5cb85c;
border-color:#4cae4c
}
.btn-success .badge {
color:#5cb85c;
background-color:#fff
}
.btn-info {
color:#fff;
background-color:#5bc0de;
border-color:#46b8da
}
.btn-info:focus,
.btn-info.focus {
color:#fff;
background-color:#31b0d5;
border-color:#1b6d85
}
.btn-info:hover {
color:#fff;
background-color:#31b0d5;
border-color:#269abc
}
.btn-info:active,
.btn-info.active,
.open>.dropdown-toggle.btn-info {
color:#fff;
background-color:#31b0d5;
border-color:#269abc
}
.btn-info:active:hover,
.btn-info.active:hover,
.open>.dropdown-toggle.btn-info:hover,
.btn-info:active:focus,
.btn-info.active:focus,
.open>.dropdown-toggle.btn-info:focus,
.btn-info:active.focus,
.btn-info.active.focus,
.open>.dropdown-toggle.btn-info.focus {
color:#fff;
background-color:#269abc;
border-color:#1b6d85
}
.btn-info:active,
.btn-info.active,
.open>.dropdown-toggle.btn-info {
background-image:none
}
.btn-info.disabled,
.btn-info[disabled],
fieldset[disabled] .btn-info,
.btn-info.disabled:hover,
.btn-info[disabled]:hover,
fieldset[disabled] .btn-info:hover,
.btn-info.disabled:focus,
.btn-info[disabled]:focus,
fieldset[disabled] .btn-info:focus,
.btn-info.disabled.focus,
.btn-info[disabled].focus,
fieldset[disabled] .btn-info.focus,
.btn-info.disabled:active,
.btn-info[disabled]:active,
fieldset[disabled] .btn-info:active,
.btn-info.disabled.active,
.btn-info[disabled].active,
fieldset[disabled] .btn-info.active {
background-color:#5bc0de;
border-color:#46b8da
}
.btn-info .badge {
color:#5bc0de;
background-color:#fff
}
.btn-warning {
background-color:#f0ad4e
}
.btn-warning:focus,
.btn-warning.focus {
color:#fff;
background-color:#ec971f;
border-color:#985f0d
}
.btn-warning:hover {
color:#fff;
background-color:#ec971f;
border-color:#d58512
}
.btn-warning:active,
.btn-warning.active,
.open>.dropdown-toggle.btn-warning {
color:#fff;
background-color:#ec971f;
border-color:#d58512
}
.btn-warning:active:hover,
.btn-warning.active:hover,
.open>.dropdown-toggle.btn-warning:hover,
.btn-warning:active:focus,
.btn-warning.active:focus,
.open>.dropdown-toggle.btn-warning:focus,
.btn-warning:active.focus,
.btn-warning.active.focus,
.open>.dropdown-toggle.btn-warning.focus {
color:#fff;
background-color:#d58512;
border-color:#985f0d
}
.btn-warning:active,
.btn-warning.active,
.open>.dropdown-toggle.btn-warning {
background-image:none
}
.btn-warning.disabled,
.btn-warning[disabled],
fieldset[disabled] .btn-warning,
.btn-warning.disabled:hover,
.btn-warning[disabled]:hover,
fieldset[disabled] .btn-warning:hover,
.btn-warning.disabled:focus,
.btn-warning[disabled]:focus,
fieldset[disabled] .btn-warning:focus,
.btn-warning.disabled.focus,
.btn-warning[disabled].focus,
fieldset[disabled] .btn-warning.focus,
.btn-warning.disabled:active,
.btn-warning[disabled]:active,
fieldset[disabled] .btn-warning:active,
.btn-warning.disabled.active,
.btn-warning[disabled].active,
fieldset[disabled] .btn-warning.active {
background-color:#f0ad4e;
border-color:#eea236
}
.btn-warning .badge {
color:#f0ad4e;
background-color:#fff
}
.btn-danger {
background-color:#d9534f
}
.btn-danger:focus,
.btn-danger.focus {
color:#fff;
background-color:#c9302c;
border-color:#761c19
}
.btn-danger:hover {
color:#fff;
background-color:#c9302c;
border-color:#ac2925
}
.btn-danger:active,
.btn-danger.active,
.open>.dropdown-toggle.btn-danger {
color:#fff;
background-color:#c9302c;
border-color:#ac2925
}
.btn-danger:active:hover,
.btn-danger.active:hover,
.open>.dropdown-toggle.btn-danger:hover,
.btn-danger:active:focus,
.btn-danger.active:focus,
.open>.dropdown-toggle.btn-danger:focus,
.btn-danger:active.focus,
.btn-danger.active.focus,
.open>.dropdown-toggle.btn-danger.focus {
color:#fff;
background-color:#ac2925;
border-color:#761c19
}
.btn-danger:active,
.btn-danger.active,
.open>.dropdown-toggle.btn-danger {
background-image:none
}
.btn-danger.disabled,
.btn-danger[disabled],
fieldset[disabled] .btn-danger,
.btn-danger.disabled:hover,
.btn-danger[disabled]:hover,
fieldset[disabled] .btn-danger:hover,
.btn-danger.disabled:focus,
.btn-danger[disabled]:focus,
fieldset[disabled] .btn-danger:focus,
.btn-danger.disabled.focus,
.btn-danger[disabled].focus,
fieldset[disabled] .btn-danger.focus,
.btn-danger.disabled:active,
.btn-danger[disabled]:active,
fieldset[disabled] .btn-danger:active,
.btn-danger.disabled.active,
.btn-danger[disabled].active,
fieldset[disabled] .btn-danger.active {
background-color:#d9534f;
border-color:#d43f3a
}
.btn-danger .badge {
color:#d9534f;
background-color:#fff
}
.btn-link {
color:#21366b;
font-weight:400;
border-radius:0
}
.btn-link,
.btn-link:active,
.btn-link.active,
.btn-link[disabled],
fieldset[disabled] .btn-link {
background-color:transparent;
-webkit-box-shadow:none;
box-shadow:none
}
.btn-link,
.btn-link:hover,
.btn-link:focus,
.btn-link:active {
border-color:transparent
}
.btn-link:hover,
.btn-link:focus {
color:#0f1831;
text-decoration:underline;
background-color:transparent
}
.btn-link[disabled]:hover,
fieldset[disabled] .btn-link:hover,
.btn-link[disabled]:focus,
fieldset[disabled] .btn-link:focus {
color:#cdcdcd;
text-decoration:none
}
.btn-lg,
.btn-group-lg>.btn {
padding:10px 16px;
font-size:18px;
line-height:1.3333333;
border-radius:6px
}
.btn-sm,
.btn-group-sm>.btn {
padding:5px 10px;
font-size:12px;
line-height:1.5;
border-radius:3px
}
.btn-xs,
.btn-group-xs>.btn {
padding:1px 5px;
font-size:12px;
line-height:1.5;
border-radius:3px
}
.btn-block {
display:block;
width:100%
}
.btn-block+.btn-block {
margin-top:5px
}
input[type="submit"].btn-block,
input[type="reset"].btn-block,
input[type="button"].btn-block {
width:100%
}
.fade {
opacity:0;
-webkit-transition:opacity .15s linear;
-o-transition:opacity .15s linear;
transition:opacity .15s linear
}
.fade.in {
opacity:1
}
.collapse {
display:none
}
.collapse.in {
display:block
}
tr.collapse.in {
display:table-row
}
tbody.collapse.in {
display:table-row-group
}
.collapsing {
position:relative;
height:0;
overflow:hidden;
-webkit-transition-property:height,visibility;
transition-property:height,visibility;
-webkit-transition-duration:.35s;
transition-duration:.35s;
-webkit-transition-timing-function:ease;
transition-timing-function:ease
}
.caret {
display:inline-block;
width:0;
height:0;
margin-left:2px;
vertical-align:middle;
border-right:4px solid transparent;
border-left:4px solid transparent
}
.dropup,
.dropdown {
position:relative
}
.dropdown-toggle:focus {
outline:0
}
.dropdown-menu {
position:absolute;
top:100%;
left:0;
z-index:1000;
display:none;
float:left;
min-width:160px;
padding:5px 0;
margin:2px 0 0;
list-style:none;
font-size:14px;
text-align:left;
background-color:#fff;
border:1px solid #ccc;
border:1px solid rgba(0,0,0,.15);
border-radius:4px;
-webkit-box-shadow:0 6px 12px rgba(0,0,0,.175);
box-shadow:0 6px 12px rgba(0,0,0,.175);
background-clip:padding-box
}
.dropdown-menu.pull-right {
right:0;
left:auto
}
.dropdown-menu .divider {
height:1px;
margin:9px 0;
overflow:hidden;
background-color:#e5e5e5
}
.dropdown-menu>li>a {
display:block;
padding:3px 20px;
clear:both;
font-weight:400;
line-height:1.42857143;
color:#333;
white-space:nowrap
}
.dropdown-menu>li>a:hover,
.dropdown-menu>li>a:focus {
text-decoration:none;
color:#262626;
background-color:#f5f5f5
}
.dropdown-menu>.active>a,
.dropdown-menu>.active>a:hover,
.dropdown-menu>.active>a:focus {
color:#fff;
text-decoration:none;
outline:0;
background-color:#21366b
}
.dropdown-menu>.disabled>a,
.dropdown-menu>.disabled>a:hover,
.dropdown-menu>.disabled>a:focus {
color:#cdcdcd
}
.dropdown-menu>.disabled>a:hover,
.dropdown-menu>.disabled>a:focus {
text-decoration:none;
background-color:transparent;
background-image:none;
filter:progid:DXImageTransform.Microsoft.gradient(enabled = false);
cursor:not-allowed
}
.open>.dropdown-menu {
display:block
}
.open>a {
outline:0
}
.dropdown-menu-right {
left:auto;
right:0
}
.dropdown-menu-left {
left:0;
right:auto
}
.dropdown-header {
display:block;
padding:3px 20px;
font-size:12px;
line-height:1.42857143;
color:#cdcdcd;
white-space:nowrap
}
.dropdown-backdrop {
position:fixed;
left:0;
right:0;
bottom:0;
top:0;
z-index:990
}
.pull-right>.dropdown-menu {
right:0;
left:auto
}
.dropup .caret,
.navbar-fixed-bottom .dropdown .caret {
border-top:0;
border-bottom:4px solid \9;
content:""
}
.dropup .dropdown-menu,
.navbar-fixed-bottom .dropdown .dropdown-menu {
top:auto;
bottom:100%;
margin-bottom:2px
}
@media (min-width:768px) {
.navbar-right .dropdown-menu {
 left:auto;
 right:0
}
.navbar-right .dropdown-menu-left {
 left:0;
 right:auto
}
}
.btn-group,
.btn-group-vertical {
position:relative;
display:inline-block;
vertical-align:middle
}
.btn-group>.btn {
float:left
}
.btn-group>.btn,
.btn-group-vertical>.btn {
position:relative
}
.btn-group>.btn:hover,
.btn-group-vertical>.btn:hover,
.btn-group>.btn:focus,
.btn-group-vertical>.btn:focus,
.btn-group>.btn:active,
.btn-group-vertical>.btn:active,
.btn-group>.btn.active,
.btn-group-vertical>.btn.active {
z-index:2
}
.btn-group .btn+.btn,
.btn-group .btn+.btn-group,
.btn-group .btn-group+.btn,
.btn-group .btn-group+.btn-group {
margin-left:-1px
}
.btn-toolbar {
margin-left:-5px
}
.btn-toolbar .btn,
.btn-toolbar .btn-group,
.btn-toolbar .input-group {
float:left
}
.btn-toolbar>.btn,
.btn-toolbar>.btn-group,
.btn-toolbar>.input-group {
margin-left:5px
}
.btn-group>.btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {
border-radius:0
}
.btn-group>.btn:first-child {
margin-left:0
}
.btn-group>.btn:first-child:not(:last-child):not(.dropdown-toggle) {
border-bottom-right-radius:0;
border-top-right-radius:0
}
.btn-group>.btn:last-child:not(:first-child),
.btn-group>.dropdown-toggle:not(:first-child) {
border-bottom-left-radius:0;
border-top-left-radius:0
}
.btn-group>.btn-group {
float:left
}
.btn-group>.btn-group:not(:first-child):not(:last-child)>.btn {
border-radius:0
}
.btn-group>.btn-group:first-child:not(:last-child)>.btn:last-child,
.btn-group>.btn-group:first-child:not(:last-child)>.dropdown-toggle {
border-bottom-right-radius:0;
border-top-right-radius:0
}
.btn-group>.btn-group:last-child:not(:first-child)>.btn:first-child {
border-bottom-left-radius:0;
border-top-left-radius:0
}
.btn-group .dropdown-toggle:active,
.btn-group.open .dropdown-toggle {
outline:0
}
.btn-group>.btn+.dropdown-toggle {
padding-left:8px;
padding-right:8px
}
.btn-group>.btn-lg+.dropdown-toggle {
padding-left:12px;
padding-right:12px
}
.btn-group.open .dropdown-toggle {
-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,.125);
box-shadow:inset 0 3px 5px rgba(0,0,0,.125)
}
.btn-group.open .dropdown-toggle.btn-link {
-webkit-box-shadow:none;
box-shadow:none
}
.btn .caret {
margin-left:0
}
.btn-lg .caret {
border-width:5px 5px 0;
border-bottom-width:0
}
.dropup .btn-lg .caret {
border-width:0 5px 5px
}
.btn-group-vertical>.btn,
.btn-group-vertical>.btn-group,
.btn-group-vertical>.btn-group>.btn {
display:block;
float:none;
width:100%;
max-width:100%
}
.btn-group-vertical>.btn+.btn,
.btn-group-vertical>.btn+.btn-group,
.btn-group-vertical>.btn-group+.btn,
.btn-group-vertical>.btn-group+.btn-group {
margin-top:-1px;
margin-left:0
}
.btn-group-vertical>.btn:not(:first-child):not(:last-child) {
border-radius:0
}
.btn-group-vertical>.btn:first-child:not(:last-child) {
border-top-right-radius:4px;
border-bottom-right-radius:0;
border-bottom-left-radius:0
}
.btn-group-vertical>.btn:last-child:not(:first-child) {
border-bottom-left-radius:4px;
border-top-right-radius:0;
border-top-left-radius:0
}
.btn-group-vertical>.btn-group:not(:first-child):not(:last-child)>.btn {
border-radius:0
}
.btn-group-vertical>.btn-group:first-child:not(:last-child)>.btn:last-child,
.btn-group-vertical>.btn-group:first-child:not(:last-child)>.dropdown-toggle {
border-bottom-right-radius:0;
border-bottom-left-radius:0
}
.btn-group-vertical>.btn-group:last-child:not(:first-child)>.btn:first-child {
border-top-right-radius:0;
border-top-left-radius:0
}
.btn-group-justified {
display:table;
width:100%;
table-layout:fixed;
border-collapse:separate
}
.btn-group-justified>.btn,
.btn-group-justified>.btn-group {
float:none;
display:table-cell;
width:1%
}
.btn-group-justified>.btn-group .btn {
width:100%
}
.btn-group-justified>.btn-group .dropdown-menu {
left:auto
}
[data-toggle="buttons"]>.btn input[type="radio"],
[data-toggle="buttons"]>.btn-group>.btn input[type="radio"],
[data-toggle="buttons"]>.btn input[type="checkbox"],
[data-toggle="buttons"]>.btn-group>.btn input[type="checkbox"] {
position:absolute;
clip:rect(0,0,0,0);
pointer-events:none
}
.input-group {
position:relative;
display:table;
border-collapse:separate
}
.input-group[class*="col-"] {
float:none;
padding-left:0;
padding-right:0
}
.input-group .form-control {
position:relative;
z-index:2;
float:left;
width:100%;
margin-bottom:0
}
.input-group-lg>.form-control,
.input-group-lg>.input-group-addon,
.input-group-lg>.input-group-btn>.btn {
height:46px;
padding:10px 16px;
font-size:18px;
line-height:1.3333333;
border-radius:6px
}
select.input-group-lg>.form-control,
select.input-group-lg>.input-group-addon,
select.input-group-lg>.input-group-btn>.btn {
height:46px;
line-height:46px
}
textarea.input-group-lg>.form-control,
textarea.input-group-lg>.input-group-addon,
textarea.input-group-lg>.input-group-btn>.btn,
select[multiple].input-group-lg>.form-control,
select[multiple].input-group-lg>.input-group-addon,
select[multiple].input-group-lg>.input-group-btn>.btn {
height:auto
}
.input-group-sm>.form-control,
.input-group-sm>.input-group-addon,
.input-group-sm>.input-group-btn>.btn {
height:30px;
padding:5px 10px;
font-size:12px;
line-height:1.5;
border-radius:3px
}
select.input-group-sm>.form-control,
select.input-group-sm>.input-group-addon,
select.input-group-sm>.input-group-btn>.btn {
height:30px;
line-height:30px
}
textarea.input-group-sm>.form-control,
textarea.input-group-sm>.input-group-addon,
textarea.input-group-sm>.input-group-btn>.btn,
select[multiple].input-group-sm>.form-control,
select[multiple].input-group-sm>.input-group-addon,
select[multiple].input-group-sm>.input-group-btn>.btn {
height:auto
}
.input-group-addon,
.input-group-btn,
.input-group .form-control {
display:table-cell
}
.input-group-addon:not(:first-child):not(:last-child),
.input-group-btn:not(:first-child):not(:last-child),
.input-group .form-control:not(:first-child):not(:last-child) {
border-radius:0
}
.input-group-addon {
white-space:nowrap
}
.input-group-addon,
.input-group-btn {
width:1%;
vertical-align:middle
}
.input-group-addon {
padding:6px 12px;
font-size:14px;
font-weight:400;
line-height:1;
color:#555;
text-align:center;
background-color:#dcdcdc;
border:1px solid #ccc;
border-radius:4px
}
.input-group-addon.input-sm {
padding:5px 10px;
font-size:12px;
border-radius:3px
}
.input-group-addon.input-lg {
padding:10px 16px;
font-size:18px;
border-radius:6px
}
.input-group-addon input[type="radio"],
.input-group-addon input[type="checkbox"] {
margin-top:0
}
.input-group .form-control:first-child,
.input-group-addon:first-child,
.input-group-btn:first-child>.btn,
.input-group-btn:first-child>.btn-group>.btn,
.input-group-btn:first-child>.dropdown-toggle,
.input-group-btn:last-child>.btn:not(:last-child):not(.dropdown-toggle),
.input-group-btn:last-child>.btn-group:not(:last-child)>.btn {
border-bottom-right-radius:0;
border-top-right-radius:0
}
.input-group-addon:first-child {
border-right:0
}
.input-group .form-control:last-child,
.input-group-addon:last-child,
.input-group-btn:last-child>.btn,
.input-group-btn:last-child>.btn-group>.btn,
.input-group-btn:last-child>.dropdown-toggle,
.input-group-btn:first-child>.btn:not(:first-child),
.input-group-btn:first-child>.btn-group:not(:first-child)>.btn {
border-bottom-left-radius:0;
border-top-left-radius:0
}
.input-group-addon:last-child {
border-left:0
}
.input-group-btn {
font-size:0;
white-space:nowrap
}
.input-group-btn,
.input-group-btn>.btn {
position:relative
}
.input-group-btn>.btn+.btn {
margin-left:-1px
}
.input-group-btn>.btn:hover,
.input-group-btn>.btn:focus,
.input-group-btn>.btn:active {
z-index:2
}
.input-group-btn:first-child>.btn,
.input-group-btn:first-child>.btn-group {
margin-right:-1px
}
.input-group-btn:last-child>.btn,
.input-group-btn:last-child>.btn-group {
z-index:2;
margin-left:-1px
}
.nav {
margin-bottom:0;
padding-left:0;
list-style:none
}
.nav>li,
.nav>li>a {
position:relative;
display:block
}
.nav>li>a {
padding:10px 15px
}
.nav>li>a:hover,
.nav>li>a:focus {
text-decoration:none;
background-color:#dcdcdc
}
.nav>li.disabled>a {
color:#cdcdcd
}
.nav>li.disabled>a:hover,
.nav>li.disabled>a:focus {
color:#cdcdcd;
text-decoration:none;
background-color:transparent;
cursor:not-allowed
}
.nav .open>a,
.nav .open>a:hover,
.nav .open>a:focus {
background-color:#dcdcdc;
border-color:#21366b
}
.nav .nav-divider {
height:1px;
margin:9px 0;
overflow:hidden;
background-color:#e5e5e5
}
.nav>li>a>img {
max-width:none
}
.nav-tabs {
border-bottom:1px solid #ddd
}
.nav-tabs>li {
float:left;
margin-bottom:-1px
}
.nav-tabs>li>a {
margin-right:2px;
line-height:1.42857143;
border:1px solid transparent;
border-radius:4px 4px 0 0
}
.nav-tabs>li>a:hover {
border-color:#dcdcdc #dcdcdc #ddd
}
.nav-tabs>li.active>a,
.nav-tabs>li.active>a:hover,
.nav-tabs>li.active>a:focus {
color:#555;
background-color:#fff;
border:1px solid #ddd;
border-bottom-color:transparent;
cursor:default
}
.nav-tabs.nav-justified {
width:100%;
border-bottom:0
}
.nav-tabs.nav-justified>li {
float:none
}
.nav-tabs.nav-justified>li>a {
text-align:center;
margin-bottom:5px
}
.nav-tabs.nav-justified>.dropdown .dropdown-menu {
top:auto;
left:auto
}
@media (min-width:768px) {
.nav-tabs.nav-justified>li {
 display:table-cell;
 width:1%
}
.nav-tabs.nav-justified>li>a {
 margin-bottom:0
}
}
.nav-tabs.nav-justified>li>a {
margin-right:0;
border-radius:4px
}
.nav-tabs.nav-justified>.active>a,
.nav-tabs.nav-justified>.active>a:hover,
.nav-tabs.nav-justified>.active>a:focus {
border:1px solid #ddd
}
@media (min-width:768px) {
.nav-tabs.nav-justified>li>a {
 border-bottom:1px solid #ddd;
 border-radius:4px 4px 0 0
}
.nav-tabs.nav-justified>.active>a,
.nav-tabs.nav-justified>.active>a:hover,
.nav-tabs.nav-justified>.active>a:focus {
 border-bottom-color:#fff
}
}
.nav-pills>li {
float:left
}
.nav-pills>li>a {
border-radius:4px
}
.nav-pills>li+li {
margin-left:2px
}
.nav-pills>li.active>a,
.nav-pills>li.active>a:hover,
.nav-pills>li.active>a:focus {
color:#fff;
background-color:#21366b
}
.nav-stacked>li {
float:none
}
.nav-stacked>li+li {
margin-top:2px;
margin-left:0
}
.nav-justified {
width:100%
}
.nav-justified>li {
float:none
}
.nav-justified>li>a {
text-align:center;
margin-bottom:5px
}
.nav-justified>.dropdown .dropdown-menu {
top:auto;
left:auto
}
@media (min-width:768px) {
.nav-justified>li {
 display:table-cell;
 width:1%
}
.nav-justified>li>a {
 margin-bottom:0
}
}
.nav-tabs-justified {
border-bottom:0
}
.nav-tabs-justified>li>a {
margin-right:0;
border-radius:4px
}
.nav-tabs-justified>.active>a,
.nav-tabs-justified>.active>a:hover,
.nav-tabs-justified>.active>a:focus {
border:1px solid #ddd
}
@media (min-width:768px) {
.nav-tabs-justified>li>a {
 border-bottom:1px solid #ddd;
 border-radius:4px 4px 0 0
}
.nav-tabs-justified>.active>a,
.nav-tabs-justified>.active>a:hover,
.nav-tabs-justified>.active>a:focus {
 border-bottom-color:#fff
}
}
.tab-content>.tab-pane {
display:none
}
.tab-content>.active {
display:block
}
.nav-tabs .dropdown-menu {
margin-top:-1px;
border-top-right-radius:0;
border-top-left-radius:0
}
.navbar {
position:relative;
min-height:50px;
margin-bottom:20px;
border:1px solid transparent
}
@media (min-width:768px) {
.navbar {
 border-radius:4px
}
}
@media (min-width:768px) {
.navbar-header {
 float:left
}
}
.navbar-collapse {
overflow-x:visible;
padding-right:15px;
padding-left:15px;
border-top:1px solid transparent;
box-shadow:inset 0 1px 0 rgba(255,255,255,.1);
-webkit-overflow-scrolling:touch
}
.navbar-collapse.in {
overflow-y:auto
}
@media (min-width:768px) {
.navbar-collapse {
 width:auto;
 border-top:0;
 box-shadow:none
}
.navbar-collapse.collapse {
 display:block!important;
 height:auto!important;
 padding-bottom:0;
 overflow:visible!important
}
.navbar-collapse.in {
 overflow-y:visible
}
.navbar-fixed-top .navbar-collapse,
.navbar-static-top .navbar-collapse,
.navbar-fixed-bottom .navbar-collapse {
 padding-left:0;
 padding-right:0
}
}
.navbar-fixed-top .navbar-collapse,
.navbar-fixed-bottom .navbar-collapse {
max-height:340px
}
@media (max-device-width:480px) and (orientation:landscape) {
.navbar-fixed-top .navbar-collapse,
.navbar-fixed-bottom .navbar-collapse {
 max-height:200px
}
}
.container>.navbar-header,
.container-fluid>.navbar-header,
.container>.navbar-collapse,
.container-fluid>.navbar-collapse {
margin-right:-15px;
margin-left:-15px
}
@media (min-width:768px) {
.container>.navbar-header,
.container-fluid>.navbar-header,
.container>.navbar-collapse,
.container-fluid>.navbar-collapse {
 margin-right:0;
 margin-left:0
}
}
.navbar-static-top {
z-index:1000;
border-width:0 0 1px
}
@media (min-width:768px) {
.navbar-static-top {
 border-radius:0
}
}
.navbar-fixed-top,
.navbar-fixed-bottom {
position:fixed;
right:0;
left:0;
z-index:1030
}
@media (min-width:768px) {
.navbar-fixed-top,
.navbar-fixed-bottom {
 border-radius:0
}
}
.navbar-fixed-top {
top:0;
border-width:0 0 1px
}
.navbar-fixed-bottom {
bottom:0;
margin-bottom:0;
border-width:1px 0 0
}
.navbar-brand {
float:left;
padding:15px;
font-size:18px;
line-height:20px;
height:50px
}
.navbar-brand:hover,
.navbar-brand:focus {
text-decoration:none
}
.navbar-brand>img {
display:block
}
@media (min-width:768px) {
.navbar>.container .navbar-brand,
.navbar>.container-fluid .navbar-brand {
 margin-left:-15px
}
}
.navbar-toggle {
position:relative;
float:right;
margin-right:15px;
padding:9px 10px;
margin-top:8px;
margin-bottom:8px;
background-color:transparent;
background-image:none;
border:1px solid transparent;
border-radius:4px
}
.navbar-toggle:focus {
outline:0
}
.navbar-toggle .icon-bar {
display:block;
width:22px;
height:2px;
border-radius:1px
}
.navbar-toggle .icon-bar+.icon-bar {
margin-top:4px
}
@media (min-width:768px) {
.navbar-toggle {
 display:none
}
}
.navbar-nav {
margin:7.5px -15px
}
.navbar-nav>li>a {
padding-top:10px;
padding-bottom:10px;
line-height:20px
}
@media (max-width:767px) {
.navbar-nav .open .dropdown-menu {
 position:static;
 float:none;
 width:auto;
 margin-top:0;
 background-color:transparent;
 border:0;
 box-shadow:none
}
.navbar-nav .open .dropdown-menu>li>a,
.navbar-nav .open .dropdown-menu .dropdown-header {
 padding:5px 15px 5px 25px
}
.navbar-nav .open .dropdown-menu>li>a {
 line-height:20px
}
.navbar-nav .open .dropdown-menu>li>a:hover,
.navbar-nav .open .dropdown-menu>li>a:focus {
 background-image:none
}
}
@media (min-width:768px) {
.navbar-nav {
 float:left;
 margin:0
}
.navbar-nav>li {
 float:left
}
.navbar-nav>li>a {
 padding-top:15px;
 padding-bottom:15px
}
}
.navbar-form {
padding:10px 15px;
border-top:1px solid transparent;
border-bottom:1px solid transparent;
-webkit-box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 0 rgba(255,255,255,.1);
box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 0 rgba(255,255,255,.1);
margin:8px -15px
}
@media (min-width:768px) {
.navbar-form .form-group {
 display:inline-block;
 margin-bottom:0;
 vertical-align:middle
}
.navbar-form .form-control {
 display:inline-block;
 width:auto;
 vertical-align:middle
}
.navbar-form .form-control-static {
 display:inline-block
}
.navbar-form .input-group {
 display:inline-table;
 vertical-align:middle
}
.navbar-form .input-group .input-group-addon,
.navbar-form .input-group .input-group-btn,
.navbar-form .input-group .form-control {
 width:auto
}
.navbar-form .input-group>.form-control {
 width:100%
}
.navbar-form .control-label {
 margin-bottom:0;
 vertical-align:middle
}
.navbar-form .radio,
.navbar-form .checkbox {
 display:inline-block;
 margin-top:0;
 margin-bottom:0;
 vertical-align:middle
}
.navbar-form .radio label,
.navbar-form .checkbox label {
 padding-left:0
}
.navbar-form .radio input[type="radio"],
.navbar-form .checkbox input[type="checkbox"] {
 position:relative;
 margin-left:0
}
.navbar-form .has-feedback .form-control-feedback {
 top:0
}
}
@media (max-width:767px) {
.navbar-form .form-group {
 margin-bottom:5px
}
.navbar-form .form-group:last-child {
 margin-bottom:0
}
}
@media (min-width:768px) {
.navbar-form {
 width:auto;
 border:0;
 margin-left:0;
 margin-right:0;
 padding-top:0;
 padding-bottom:0;
 -webkit-box-shadow:none;
 box-shadow:none
}
}
.navbar-nav>li>.dropdown-menu {
margin-top:0;
border-top-right-radius:0;
border-top-left-radius:0
}
.navbar-fixed-bottom .navbar-nav>li>.dropdown-menu {
margin-bottom:0;
border-top-right-radius:4px;
border-top-left-radius:4px;
border-bottom-right-radius:0;
border-bottom-left-radius:0
}
.navbar-btn {
margin-top:8px;
margin-bottom:8px
}
.navbar-btn.btn-sm {
margin-top:10px;
margin-bottom:10px
}
.navbar-btn.btn-xs {
margin-top:14px;
margin-bottom:14px
}
.navbar-text {
margin-top:15px;
margin-bottom:15px
}
@media (min-width:768px) {
.navbar-text {
 float:left;
 margin-left:15px;
 margin-right:15px
}
}
@media (min-width:768px) {
.navbar-left {
 float:left!important
}
.navbar-right {
 float:right!important;
 margin-right:-15px
}
.navbar-right~.navbar-right {
 margin-right:0
}
}
.navbar-default {
background-color:#f8f8f8;
border-color:#e7e7e7
}
.navbar-default .navbar-brand {
color:#777
}
.navbar-default .navbar-brand:hover,
.navbar-default .navbar-brand:focus {
color:#5e5e5e;
background-color:transparent
}
.navbar-default .navbar-text,
.navbar-default .navbar-nav>li>a {
color:#777
}
.navbar-default .navbar-nav>li>a:hover,
.navbar-default .navbar-nav>li>a:focus {
color:#333;
background-color:transparent
}
.navbar-default .navbar-nav>.active>a,
.navbar-default .navbar-nav>.active>a:hover,
.navbar-default .navbar-nav>.active>a:focus {
color:#555;
background-color:#e7e7e7
}
.navbar-default .navbar-nav>.disabled>a,
.navbar-default .navbar-nav>.disabled>a:hover,
.navbar-default .navbar-nav>.disabled>a:focus {
color:#ccc;
background-color:transparent
}
.navbar-default .navbar-toggle {
border-color:#ddd
}
.navbar-default .navbar-toggle:hover,
.navbar-default .navbar-toggle:focus {
background-color:#ddd
}
.navbar-default .navbar-toggle .icon-bar {
background-color:#888
}
.navbar-default .navbar-collapse,
.navbar-default .navbar-form {
border-color:#e7e7e7
}
.navbar-default .navbar-nav>.open>a,
.navbar-default .navbar-nav>.open>a:hover,
.navbar-default .navbar-nav>.open>a:focus {
background-color:#e7e7e7;
color:#555
}
@media (max-width:767px) {
.navbar-default .navbar-nav .open .dropdown-menu>li>a {
 color:#777
}
.navbar-default .navbar-nav .open .dropdown-menu>li>a:hover,
.navbar-default .navbar-nav .open .dropdown-menu>li>a:focus {
 color:#333;
 background-color:transparent
}
.navbar-default .navbar-nav .open .dropdown-menu>.active>a,
.navbar-default .navbar-nav .open .dropdown-menu>.active>a:hover,
.navbar-default .navbar-nav .open .dropdown-menu>.active>a:focus {
 color:#555;
 background-color:#e7e7e7
}
.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a,
.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a:hover,
.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a:focus {
 color:#ccc;
 background-color:transparent
}
}
.navbar-default .navbar-link {
color:#777
}
.navbar-default .navbar-link:hover {
color:#333
}
.navbar-default .btn-link {
color:#777
}
.navbar-default .btn-link:hover,
.navbar-default .btn-link:focus {
color:#333
}
.navbar-default .btn-link[disabled]:hover,
fieldset[disabled] .navbar-default .btn-link:hover,
.navbar-default .btn-link[disabled]:focus,
fieldset[disabled] .navbar-default .btn-link:focus {
color:#ccc
}
.navbar-inverse {
background-color:#222;
border-color:#080808
}
.navbar-inverse .navbar-brand {
color:#f3f3f3
}
.navbar-inverse .navbar-brand:hover,
.navbar-inverse .navbar-brand:focus {
color:#fff;
background-color:transparent
}
.navbar-inverse .navbar-text,
.navbar-inverse .navbar-nav>li>a {
color:#f3f3f3
}
.navbar-inverse .navbar-nav>li>a:hover,
.navbar-inverse .navbar-nav>li>a:focus {
color:#fff;
background-color:transparent
}
.navbar-inverse .navbar-nav>.active>a,
.navbar-inverse .navbar-nav>.active>a:hover,
.navbar-inverse .navbar-nav>.active>a:focus {
color:#fff;
background-color:#080808
}
.navbar-inverse .navbar-nav>.disabled>a,
.navbar-inverse .navbar-nav>.disabled>a:hover,
.navbar-inverse .navbar-nav>.disabled>a:focus {
color:#444;
background-color:transparent
}
.navbar-inverse .navbar-toggle {
border-color:#333
}
.navbar-inverse .navbar-toggle:hover,
.navbar-inverse .navbar-toggle:focus {
background-color:#333
}
.navbar-inverse .navbar-toggle .icon-bar {
background-color:#fff
}
.navbar-inverse .navbar-collapse,
.navbar-inverse .navbar-form {
border-color:#101010
}
.navbar-inverse .navbar-nav>.open>a,
.navbar-inverse .navbar-nav>.open>a:hover,
.navbar-inverse .navbar-nav>.open>a:focus {
background-color:#080808;
color:#fff
}
@media (max-width:767px) {
.navbar-inverse .navbar-nav .open .dropdown-menu>.dropdown-header {
 border-color:#080808
}
.navbar-inverse .navbar-nav .open .dropdown-menu .divider {
 background-color:#080808
}
.navbar-inverse .navbar-nav .open .dropdown-menu>li>a {
 color:#f3f3f3
}
.navbar-inverse .navbar-nav .open .dropdown-menu>li>a:hover,
.navbar-inverse .navbar-nav .open .dropdown-menu>li>a:focus {
 color:#fff;
 background-color:transparent
}
.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a,
.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a:hover,
.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a:focus {
 color:#fff;
 background-color:#080808
}
.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a,
.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a:hover,
.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a:focus {
 color:#444;
 background-color:transparent
}
}
.navbar-inverse .navbar-link {
color:#f3f3f3
}
.navbar-inverse .navbar-link:hover {
color:#fff
}
.navbar-inverse .btn-link {
color:#f3f3f3
}
.navbar-inverse .btn-link:hover,
.navbar-inverse .btn-link:focus {
color:#fff
}
.navbar-inverse .btn-link[disabled]:hover,
fieldset[disabled] .navbar-inverse .btn-link:hover,
.navbar-inverse .btn-link[disabled]:focus,
fieldset[disabled] .navbar-inverse .btn-link:focus {
color:#444
}
.breadcrumb {
padding:8px 15px;
margin-bottom:20px;
list-style:none;
background-color:#f5f5f5;
border-radius:4px
}
.breadcrumb>li {
display:inline-block
}
.breadcrumb>li+li:before {
content:"/\00a0";
padding:0 5px;
color:#ccc
}
.breadcrumb>.active {
color:#cdcdcd
}
.pagination {
display:inline-block;
padding-left:0;
margin:20px 0;
border-radius:4px
}
.pagination>li {
display:inline
}
.pagination>li>a,
.pagination>li>span {
position:relative;
float:left;
padding:6px 12px;
line-height:1.42857143;
text-decoration:none;
color:#21366b;
background-color:#fff;
border:1px solid #ddd;
margin-left:-1px
}
.pagination>li:first-child>a,
.pagination>li:first-child>span {
margin-left:0;
border-bottom-left-radius:4px;
border-top-left-radius:4px
}
.pagination>li:last-child>a,
.pagination>li:last-child>span {
border-bottom-right-radius:4px;
border-top-right-radius:4px
}
.pagination>li>a:hover,
.pagination>li>span:hover,
.pagination>li>a:focus,
.pagination>li>span:focus {
z-index:3;
color:#0f1831;
background-color:#dcdcdc;
border-color:#ddd
}
.pagination>.active>a,
.pagination>.active>span,
.pagination>.active>a:hover,
.pagination>.active>span:hover,
.pagination>.active>a:focus,
.pagination>.active>span:focus {
z-index:2;
color:#fff;
background-color:#21366b;
border-color:#21366b;
cursor:default
}
.pagination>.disabled>span,
.pagination>.disabled>span:hover,
.pagination>.disabled>span:focus,
.pagination>.disabled>a,
.pagination>.disabled>a:hover,
.pagination>.disabled>a:focus {
color:#cdcdcd;
background-color:#fff;
border-color:#ddd;
cursor:not-allowed
}
.pagination-lg>li>a,
.pagination-lg>li>span {
padding:10px 16px;
font-size:18px;
line-height:1.3333333
}
.pagination-lg>li:first-child>a,
.pagination-lg>li:first-child>span {
border-bottom-left-radius:6px;
border-top-left-radius:6px
}
.pagination-lg>li:last-child>a,
.pagination-lg>li:last-child>span {
border-bottom-right-radius:6px;
border-top-right-radius:6px
}
.pagination-sm>li>a,
.pagination-sm>li>span {
padding:5px 10px;
font-size:12px;
line-height:1.5
}
.pagination-sm>li:first-child>a,
.pagination-sm>li:first-child>span {
border-bottom-left-radius:3px;
border-top-left-radius:3px
}
.pagination-sm>li:last-child>a,
.pagination-sm>li:last-child>span {
border-bottom-right-radius:3px;
border-top-right-radius:3px
}
.pager {
padding-left:0;
margin:20px 0;
list-style:none;
text-align:center
}
.pager li {
display:inline
}
.pager li>a,
.pager li>span {
display:inline-block;
padding:5px 14px;
background-color:#fff;
border:1px solid #ddd;
border-radius:15px
}
.pager li>a:hover,
.pager li>a:focus {
text-decoration:none;
background-color:#dcdcdc
}
.pager .next>a,
.pager .next>span {
float:right
}
.pager .previous>a,
.pager .previous>span {
float:left
}
.pager .disabled>a,
.pager .disabled>a:hover,
.pager .disabled>a:focus,
.pager .disabled>span {
color:#cdcdcd;
background-color:#fff;
cursor:not-allowed
}
.label {
display:inline;
padding:.2em .6em .3em;
font-size:75%;
font-weight:700;
line-height:1;
color:#fff;
text-align:center;
white-space:nowrap;
vertical-align:baseline;
border-radius:.25em
}
a.label:hover,
a.label:focus {
color:#fff;
text-decoration:none;
cursor:pointer
}
.label:empty {
display:none
}
.btn .label {
position:relative;
top:-1px
}
.label-default {
background-color:#cdcdcd
}
.label-default[href]:hover,
.label-default[href]:focus {
background-color:#b4b4b4
}
.label-primary {
background-color:#21366b
}
.label-primary[href]:hover,
.label-primary[href]:focus {
background-color:#152244
}
.label-success {
background-color:#5cb85c
}
.label-success[href]:hover,
.label-success[href]:focus {
background-color:#449d44
}
.label-info {
background-color:#5bc0de
}
.label-info[href]:hover,
.label-info[href]:focus {
background-color:#31b0d5
}
.label-warning {
background-color:#f0ad4e
}
.label-warning[href]:hover,
.label-warning[href]:focus {
background-color:#ec971f
}
.label-danger {
background-color:#d9534f
}
.label-danger[href]:hover,
.label-danger[href]:focus {
background-color:#c9302c
}
.badge {
display:inline-block;
min-width:10px;
padding:3px 7px;
font-size:12px;
font-weight:700;
color:#fff;
line-height:1;
vertical-align:middle;
white-space:nowrap;
text-align:center;
background-color:#cdcdcd;
border-radius:10px
}
.badge:empty {
display:none
}
.btn .badge {
position:relative;
top:-1px
}
.btn-xs .badge,
.btn-group-xs>.btn .badge {
top:0;
padding:1px 5px
}
a.badge:hover,
a.badge:focus {
color:#fff;
text-decoration:none;
cursor:pointer
}
.list-group-item.active>.badge,
.nav-pills>.active>a>.badge {
color:#21366b;
background-color:#fff
}
.list-group-item>.badge {
float:right
}
.list-group-item>.badge+.badge {
margin-right:5px
}
.nav-pills>li>a>.badge {
margin-left:3px
}
.jumbotron {
padding-top:30px;
padding-bottom:30px;
margin-bottom:30px;
background-color:#dcdcdc
}
.jumbotron,
.jumbotron h1,
.jumbotron .h1 {
color:inherit
}
.jumbotron p {
margin-bottom:15px;
font-size:21px;
font-weight:200
}
.jumbotron>hr {
border-top-color:#c3c3c3
}
.container .jumbotron,
.container-fluid .jumbotron {
border-radius:6px
}
.jumbotron .container {
max-width:100%
}
@media screen and (min-width:768px) {
.jumbotron {
 padding-top:48px;
 padding-bottom:48px
}
.container .jumbotron,
.container-fluid .jumbotron {
 padding-left:60px;
 padding-right:60px
}
.jumbotron h1,
.jumbotron .h1 {
 font-size:63px
}
}
.thumbnail {
display:block;
padding:4px;
margin-bottom:20px;
line-height:1.42857143;
background-color:#fff;
border:1px solid #ddd;
border-radius:4px;
-webkit-transition:border .2s ease-in-out;
-o-transition:border .2s ease-in-out;
transition:border .2s ease-in-out
}
.thumbnail>img,
.thumbnail a>img {
margin-left:auto;
margin-right:auto
}
a.thumbnail:hover,
a.thumbnail:focus,
a.thumbnail.active {
border-color:#21366b
}
.thumbnail .caption {
padding:9px;
color:#333
}
.alert {
padding:15px;
margin-bottom:20px;
border:1px solid transparent;
border-radius:4px
}
.alert h4 {
margin-top:0;
color:inherit
}
.alert .alert-link {
font-weight:700
}
.alert>p,
.alert>ul {
margin-bottom:0
}
.alert>p+p {
margin-top:5px
}
.alert-dismissable,
.alert-dismissible {
padding-right:35px
}
.alert-dismissable .close,
.alert-dismissible .close {
position:relative;
top:-2px;
right:-21px;
color:inherit
}
.alert-success {
background-color:#dff0d8;
border-color:#d6e9c6
}
.alert-success hr {
border-top-color:#c9e2b3
}
.alert-success .alert-link {
color:#2b542c
}
.alert-info {
background-color:#d9edf7;
border-color:#bce8f1;
color:#31708f
}
.alert-info hr {
border-top-color:#a6e1ec
}
.alert-info .alert-link {
color:#245269
}
.alert-warning {
background-color:#fcf8e3;
border-color:#faebcc
}
.alert-warning hr {
border-top-color:#f7e1b5
}
.alert-warning .alert-link {
color:#66512c
}
.alert-danger {
background-color:#f2dede;
border-color:#ebccd1
}
.alert-danger hr {
border-top-color:#e4b9c0
}
.alert-danger .alert-link {
color:#843534
}
@-webkit-keyframes progress-bar-stripes {
from {
 background-position:40px 0
}
to {
 background-position:0 0
}
}
@keyframes progress-bar-stripes {
from {
 background-position:40px 0
}
to {
 background-position:0 0
}
}
.progress {
overflow:hidden;
height:20px;
margin-bottom:20px;
background-color:#f5f5f5;
border-radius:4px;
-webkit-box-shadow:inset 0 1px 2px rgba(0,0,0,.1);
box-shadow:inset 0 1px 2px rgba(0,0,0,.1)
}
.progress-bar {
float:left;
width:0%;
height:100%;
font-size:12px;
line-height:20px;
color:#fff;
text-align:center;
background-color:#21366b;
-webkit-box-shadow:inset 0 -1px 0 rgba(0,0,0,.15);
box-shadow:inset 0 -1px 0 rgba(0,0,0,.15);
-webkit-transition:width .6s ease;
-o-transition:width .6s ease;
transition:width .6s ease
}
.progress-striped .progress-bar,
.progress-bar-striped {
background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-size:40px 40px
}
.progress.active .progress-bar,
.progress-bar.active {
-webkit-animation:progress-bar-stripes 2s linear infinite;
-o-animation:progress-bar-stripes 2s linear infinite;
animation:progress-bar-stripes 2s linear infinite
}
.progress-bar-success {
background-color:#5cb85c
}
.progress-striped .progress-bar-success {
background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent)
}
.progress-bar-info {
background-color:#5bc0de
}
.progress-striped .progress-bar-info {
background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent)
}
.progress-bar-warning {
background-color:#f0ad4e
}
.progress-striped .progress-bar-warning {
background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent)
}
.progress-bar-danger {
background-color:#d9534f
}
.progress-striped .progress-bar-danger {
background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent);
background-image:linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent 25%,transparent 50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent 75%,transparent)
}
.media {
margin-top:15px
}
.media:first-child {
margin-top:0
}
.media,
.media-body {
zoom:1;
overflow:hidden
}
.media-body {
width:10000px
}
.media-object {
display:block
}
.media-object.img-thumbnail {
max-width:none
}
.media-right,
.media>.pull-right {
padding-left:10px
}
.media-left,
.media>.pull-left {
padding-right:10px
}
.media-left,
.media-right,
.media-body {
display:table-cell;
vertical-align:top
}
.media-middle {
vertical-align:middle
}
.media-bottom {
vertical-align:bottom
}
.media-heading {
margin-top:0;
margin-bottom:5px
}
.media-list {
padding-left:0;
list-style:none
}
.list-group {
margin-bottom:20px;
padding-left:0
}
.list-group-item {
position:relative;
display:block;
padding:10px 15px;
margin-bottom:-1px;
background-color:#fff;
border:1px solid #ddd
}
.list-group-item:first-child {
border-top-right-radius:4px;
border-top-left-radius:4px
}
.list-group-item:last-child {
margin-bottom:0;
border-bottom-right-radius:4px;
border-bottom-left-radius:4px
}
a.list-group-item,
button.list-group-item {
color:#555
}
a.list-group-item .list-group-item-heading,
button.list-group-item .list-group-item-heading {
color:#333
}
a.list-group-item:hover,
button.list-group-item:hover,
a.list-group-item:focus,
button.list-group-item:focus {
text-decoration:none;
color:#555;
background-color:#f5f5f5
}
button.list-group-item {
width:100%;
text-align:left
}
.list-group-item.disabled,
.list-group-item.disabled:hover,
.list-group-item.disabled:focus {
background-color:#dcdcdc;
color:#cdcdcd;
cursor:not-allowed
}
.list-group-item.disabled .list-group-item-heading,
.list-group-item.disabled:hover .list-group-item-heading,
.list-group-item.disabled:focus .list-group-item-heading {
color:inherit
}
.list-group-item.disabled .list-group-item-text,
.list-group-item.disabled:hover .list-group-item-text,
.list-group-item.disabled:focus .list-group-item-text {
color:#cdcdcd
}
.list-group-item.active,
.list-group-item.active:hover,
.list-group-item.active:focus {
z-index:2;
color:#fff;
background-color:#21366b;
border-color:#21366b
}
.list-group-item.active .list-group-item-heading,
.list-group-item.active:hover .list-group-item-heading,
.list-group-item.active:focus .list-group-item-heading,
.list-group-item.active .list-group-item-heading>small,
.list-group-item.active:hover .list-group-item-heading>small,
.list-group-item.active:focus .list-group-item-heading>small,
.list-group-item.active .list-group-item-heading>.small,
.list-group-item.active:hover .list-group-item-heading>.small,
.list-group-item.active:focus .list-group-item-heading>.small {
color:inherit
}
.list-group-item.active .list-group-item-text,
.list-group-item.active:hover .list-group-item-text,
.list-group-item.active:focus .list-group-item-text {
color:#8099d8
}
.list-group-item-success {
color:#3c763d;
background-color:#dff0d8
}
a.list-group-item-success,
button.list-group-item-success {
color:#3c763d
}
a.list-group-item-success .list-group-item-heading,
button.list-group-item-success .list-group-item-heading {
color:inherit
}
a.list-group-item-success:hover,
button.list-group-item-success:hover,
a.list-group-item-success:focus,
button.list-group-item-success:focus {
color:#3c763d;
background-color:#d0e9c6
}
a.list-group-item-success.active,
button.list-group-item-success.active,
a.list-group-item-success.active:hover,
button.list-group-item-success.active:hover,
a.list-group-item-success.active:focus,
button.list-group-item-success.active:focus {
color:#fff;
background-color:#3c763d;
border-color:#3c763d
}
.list-group-item-info {
color:#31708f;
background-color:#d9edf7
}
a.list-group-item-info,
button.list-group-item-info {
color:#31708f
}
a.list-group-item-info .list-group-item-heading,
button.list-group-item-info .list-group-item-heading {
color:inherit
}
a.list-group-item-info:hover,
button.list-group-item-info:hover,
a.list-group-item-info:focus,
button.list-group-item-info:focus {
color:#31708f;
background-color:#c4e3f3
}
a.list-group-item-info.active,
button.list-group-item-info.active,
a.list-group-item-info.active:hover,
button.list-group-item-info.active:hover,
a.list-group-item-info.active:focus,
button.list-group-item-info.active:focus {
color:#fff;
background-color:#31708f;
border-color:#31708f
}
.list-group-item-warning {
color:#8a6d3b;
background-color:#fcf8e3
}
a.list-group-item-warning,
button.list-group-item-warning {
color:#8a6d3b
}
a.list-group-item-warning .list-group-item-heading,
button.list-group-item-warning .list-group-item-heading {
color:inherit
}
a.list-group-item-warning:hover,
button.list-group-item-warning:hover,
a.list-group-item-warning:focus,
button.list-group-item-warning:focus {
color:#8a6d3b;
background-color:#faf2cc
}
a.list-group-item-warning.active,
button.list-group-item-warning.active,
a.list-group-item-warning.active:hover,
button.list-group-item-warning.active:hover,
a.list-group-item-warning.active:focus,
button.list-group-item-warning.active:focus {
color:#fff;
background-color:#8a6d3b;
border-color:#8a6d3b
}
.list-group-item-danger {
color:#a94442;
background-color:#f2dede
}
a.list-group-item-danger,
button.list-group-item-danger {
color:#a94442
}
a.list-group-item-danger .list-group-item-heading,
button.list-group-item-danger .list-group-item-heading {
color:inherit
}
a.list-group-item-danger:hover,
button.list-group-item-danger:hover,
a.list-group-item-danger:focus,
button.list-group-item-danger:focus {
color:#a94442;
background-color:#ebcccc
}
a.list-group-item-danger.active,
button.list-group-item-danger.active,
a.list-group-item-danger.active:hover,
button.list-group-item-danger.active:hover,
a.list-group-item-danger.active:focus,
button.list-group-item-danger.active:focus {
color:#fff;
background-color:#a94442;
border-color:#a94442
}
.list-group-item-heading {
margin-top:0;
margin-bottom:5px
}
.list-group-item-text {
margin-bottom:0;
line-height:1.3
}
.panel {
margin-bottom:20px;
background-color:#fff;
border:1px solid transparent;
border-radius:4px;
-webkit-box-shadow:0 1px 1px rgba(0,0,0,.05);
box-shadow:0 1px 1px rgba(0,0,0,.05)
}
.panel-body {
padding:15px
}
.panel-heading {
padding:10px 15px;
border-bottom:1px solid transparent;
border-top-right-radius:3px;
border-top-left-radius:3px
}
.panel-heading>.dropdown .dropdown-toggle {
color:inherit
}
.panel-title {
margin-top:0;
margin-bottom:0;
font-size:16px
}
.panel-title,
.panel-title>a,
.panel-title>small,
.panel-title>.small,
.panel-title>small>a,
.panel-title>.small>a {
color:inherit
}
.panel-footer {
padding:10px 15px;
background-color:#f5f5f5;
border-top:1px solid #ddd;
border-bottom-right-radius:3px;
border-bottom-left-radius:3px
}
.panel>.list-group,
.panel>.panel-collapse>.list-group {
margin-bottom:0
}
.panel>.list-group .list-group-item,
.panel>.panel-collapse>.list-group .list-group-item {
border-width:1px 0;
border-radius:0
}
.panel>.list-group:first-child .list-group-item:first-child,
.panel>.panel-collapse>.list-group:first-child .list-group-item:first-child {
border-top:0;
border-top-right-radius:3px;
border-top-left-radius:3px
}
.panel>.list-group:last-child .list-group-item:last-child,
.panel>.panel-collapse>.list-group:last-child .list-group-item:last-child {
border-bottom:0;
border-bottom-right-radius:3px;
border-bottom-left-radius:3px
}
.panel>.panel-heading+.panel-collapse>.list-group .list-group-item:first-child {
border-top-right-radius:0;
border-top-left-radius:0
}
.panel-heading+.list-group .list-group-item:first-child {
border-top-width:0
}
.list-group+.panel-footer {
border-top-width:0
}
.panel>.table,
.panel>.table-responsive>.table,
.panel>.panel-collapse>.table {
margin-bottom:0
}
.panel>.table caption,
.panel>.table-responsive>.table caption,
.panel>.panel-collapse>.table caption {
padding-left:15px;
padding-right:15px
}
.panel>.table:first-child,
.panel>.table-responsive:first-child>.table:first-child,
.panel>.table:first-child>thead:first-child>tr:first-child,
.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child,
.panel>.table:first-child>tbody:first-child>tr:first-child,
.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child {
border-top-right-radius:3px;
border-top-left-radius:3px
}
.panel>.table:first-child>thead:first-child>tr:first-child td:first-child,
.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child td:first-child,
.panel>.table:first-child>tbody:first-child>tr:first-child td:first-child,
.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child td:first-child,
.panel>.table:first-child>thead:first-child>tr:first-child th:first-child,
.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child th:first-child,
.panel>.table:first-child>tbody:first-child>tr:first-child th:first-child,
.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child th:first-child {
border-top-left-radius:3px
}
.panel>.table:first-child>thead:first-child>tr:first-child td:last-child,
.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child td:last-child,
.panel>.table:first-child>tbody:first-child>tr:first-child td:last-child,
.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child td:last-child,
.panel>.table:first-child>thead:first-child>tr:first-child th:last-child,
.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child th:last-child,
.panel>.table:first-child>tbody:first-child>tr:first-child th:last-child,
.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child th:last-child {
border-top-right-radius:3px
}
.panel>.table:last-child,
.panel>.table-responsive:last-child>.table:last-child,
.panel>.table:last-child>tbody:last-child>tr:last-child,
.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child,
.panel>.table:last-child>tfoot:last-child>tr:last-child,
.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child {
border-bottom-right-radius:3px;
border-bottom-left-radius:3px
}
.panel>.table:last-child>tbody:last-child>tr:last-child td:first-child,
.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child td:first-child,
.panel>.table:last-child>tfoot:last-child>tr:last-child td:first-child,
.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child td:first-child,
.panel>.table:last-child>tbody:last-child>tr:last-child th:first-child,
.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child th:first-child,
.panel>.table:last-child>tfoot:last-child>tr:last-child th:first-child,
.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child th:first-child {
border-bottom-left-radius:3px
}
.panel>.table:last-child>tbody:last-child>tr:last-child td:last-child,
.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child td:last-child,
.panel>.table:last-child>tfoot:last-child>tr:last-child td:last-child,
.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child td:last-child,
.panel>.table:last-child>tbody:last-child>tr:last-child th:last-child,
.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child th:last-child,
.panel>.table:last-child>tfoot:last-child>tr:last-child th:last-child,
.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child th:last-child {
border-bottom-right-radius:3px
}
.panel>.panel-body+.table,
.panel>.panel-body+.table-responsive,
.panel>.table+.panel-body,
.panel>.table-responsive+.panel-body {
border-top:1px solid #ddd
}
.panel>.table>tbody:first-child>tr:first-child th,
.panel>.table>tbody:first-child>tr:first-child td {
border-top:0
}
.panel>.table-bordered,
.panel>.table-responsive>.table-bordered {
border:0
}
.panel>.table-bordered>thead>tr>th:first-child,
.panel>.table-responsive>.table-bordered>thead>tr>th:first-child,
.panel>.table-bordered>tbody>tr>th:first-child,
.panel>.table-responsive>.table-bordered>tbody>tr>th:first-child,
.panel>.table-bordered>tfoot>tr>th:first-child,
.panel>.table-responsive>.table-bordered>tfoot>tr>th:first-child,
.panel>.table-bordered>thead>tr>td:first-child,
.panel>.table-responsive>.table-bordered>thead>tr>td:first-child,
.panel>.table-bordered>tbody>tr>td:first-child,
.panel>.table-responsive>.table-bordered>tbody>tr>td:first-child,
.panel>.table-bordered>tfoot>tr>td:first-child,
.panel>.table-responsive>.table-bordered>tfoot>tr>td:first-child {
border-left:0
}
.panel>.table-bordered>thead>tr>th:last-child,
.panel>.table-responsive>.table-bordered>thead>tr>th:last-child,
.panel>.table-bordered>tbody>tr>th:last-child,
.panel>.table-responsive>.table-bordered>tbody>tr>th:last-child,
.panel>.table-bordered>tfoot>tr>th:last-child,
.panel>.table-responsive>.table-bordered>tfoot>tr>th:last-child,
.panel>.table-bordered>thead>tr>td:last-child,
.panel>.table-responsive>.table-bordered>thead>tr>td:last-child,
.panel>.table-bordered>tbody>tr>td:last-child,
.panel>.table-responsive>.table-bordered>tbody>tr>td:last-child,
.panel>.table-bordered>tfoot>tr>td:last-child,
.panel>.table-responsive>.table-bordered>tfoot>tr>td:last-child {
border-right:0
}
.panel>.table-bordered>thead>tr:first-child>td,
.panel>.table-responsive>.table-bordered>thead>tr:first-child>td,
.panel>.table-bordered>tbody>tr:first-child>td,
.panel>.table-responsive>.table-bordered>tbody>tr:first-child>td,
.panel>.table-bordered>thead>tr:first-child>th,
.panel>.table-responsive>.table-bordered>thead>tr:first-child>th,
.panel>.table-bordered>tbody>tr:first-child>th,
.panel>.table-responsive>.table-bordered>tbody>tr:first-child>th {
border-bottom:0
}
.panel>.table-bordered>tbody>tr:last-child>td,
.panel>.table-responsive>.table-bordered>tbody>tr:last-child>td,
.panel>.table-bordered>tfoot>tr:last-child>td,
.panel>.table-responsive>.table-bordered>tfoot>tr:last-child>td,
.panel>.table-bordered>tbody>tr:last-child>th,
.panel>.table-responsive>.table-bordered>tbody>tr:last-child>th,
.panel>.table-bordered>tfoot>tr:last-child>th,
.panel>.table-responsive>.table-bordered>tfoot>tr:last-child>th {
border-bottom:0
}
.panel>.table-responsive {
border:0;
margin-bottom:0
}
.panel-group {
margin-bottom:20px
}
.panel-group .panel {
margin-bottom:0;
border-radius:4px
}
.panel-group .panel+.panel {
margin-top:5px
}
.panel-group .panel-heading {
border-bottom:0
}
.panel-group .panel-heading+.panel-collapse>.panel-body,
.panel-group .panel-heading+.panel-collapse>.list-group {
border-top:1px solid #ddd
}
.panel-group .panel-footer {
border-top:0
}
.panel-group .panel-footer+.panel-collapse .panel-body {
border-bottom:1px solid #ddd
}
.panel-default {
border-color:#ddd
}
.panel-default>.panel-heading {
color:#333;
background-color:#f5f5f5;
border-color:#ddd
}
.panel-default>.panel-heading+.panel-collapse>.panel-body {
border-top-color:#ddd
}
.panel-default>.panel-heading .badge {
color:#f5f5f5;
background-color:#333
}
.panel-default>.panel-footer+.panel-collapse>.panel-body {
border-bottom-color:#ddd
}
.panel-primary {
border-color:#21366b
}
.panel-primary>.panel-heading {
color:#fff;
background-color:#21366b;
border-color:#21366b
}
.panel-primary>.panel-heading+.panel-collapse>.panel-body {
border-top-color:#21366b
}
.panel-primary>.panel-heading .badge {
color:#21366b;
background-color:#fff
}
.panel-primary>.panel-footer+.panel-collapse>.panel-body {
border-bottom-color:#21366b
}
.panel-success {
border-color:#d6e9c6
}
.panel-success>.panel-heading {
color:#3c763d;
background-color:#dff0d8;
border-color:#d6e9c6
}
.panel-success>.panel-heading+.panel-collapse>.panel-body {
border-top-color:#d6e9c6
}
.panel-success>.panel-heading .badge {
color:#dff0d8;
background-color:#3c763d
}
.panel-success>.panel-footer+.panel-collapse>.panel-body {
border-bottom-color:#d6e9c6
}
.panel-info {
border-color:#bce8f1
}
.panel-info>.panel-heading {
color:#31708f;
background-color:#d9edf7;
border-color:#bce8f1
}
.panel-info>.panel-heading+.panel-collapse>.panel-body {
border-top-color:#bce8f1
}
.panel-info>.panel-heading .badge {
color:#d9edf7;
background-color:#31708f
}
.panel-info>.panel-footer+.panel-collapse>.panel-body {
border-bottom-color:#bce8f1
}
.panel-warning {
border-color:#faebcc
}
.panel-warning>.panel-heading {
color:#8a6d3b;
background-color:#fcf8e3;
border-color:#faebcc
}
.panel-warning>.panel-heading+.panel-collapse>.panel-body {
border-top-color:#faebcc
}
.panel-warning>.panel-heading .badge {
color:#fcf8e3;
background-color:#8a6d3b
}
.panel-warning>.panel-footer+.panel-collapse>.panel-body {
border-bottom-color:#faebcc
}
.panel-danger {
border-color:#ebccd1
}
.panel-danger>.panel-heading {
color:#a94442;
background-color:#f2dede;
border-color:#ebccd1
}
.panel-danger>.panel-heading+.panel-collapse>.panel-body {
border-top-color:#ebccd1
}
.panel-danger>.panel-heading .badge {
color:#f2dede;
background-color:#a94442
}
.panel-danger>.panel-footer+.panel-collapse>.panel-body {
border-bottom-color:#ebccd1
}
.embed-responsive {
position:relative;
display:block;
height:0;
padding:0;
overflow:hidden
}
.embed-responsive .embed-responsive-item,
.embed-responsive iframe,
.embed-responsive embed,
.embed-responsive object,
.embed-responsive video {
position:absolute;
top:0;
left:0;
bottom:0;
height:100%;
width:100%;
border:0
}
.embed-responsive-16by9 {
padding-bottom:56.25%
}
.embed-responsive-4by3 {
padding-bottom:75%
}
.well {
min-height:20px;
padding:19px;
margin-bottom:20px;
background-color:#f5f5f5;
border:1px solid #e3e3e3;
border-radius:4px;
-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.05);
box-shadow:inset 0 1px 1px rgba(0,0,0,.05)
}
.well blockquote {
border-color:#ddd;
border-color:rgba(0,0,0,.15)
}
.well-lg {
padding:24px;
border-radius:6px
}
.well-sm {
padding:9px;
border-radius:3px
}
.close {
float:right;
font-size:21px;
font-weight:700;
line-height:1;
color:#000;
text-shadow:0 1px 0 #fff;
opacity:.2;
filter:alpha(opacity=20)
}
.close:hover,
.close:focus {
color:#000;
text-decoration:none;
cursor:pointer;
opacity:.5;
filter:alpha(opacity=50)
}
button.close {
padding:0;
cursor:pointer;
background:0 0;
border:0;
-webkit-appearance:none
}
.modal-open,
.modal {
overflow:hidden
}
.modal {
display:none;
position:fixed;
top:0;
right:0;
bottom:0;
left:0;
z-index:1050;
-webkit-overflow-scrolling:touch;
outline:0
}
.modal.fade .modal-dialog {
-webkit-transform:translate(0,-25%);
-ms-transform:translate(0,-25%);
-o-transform:translate(0,-25%);
transform:translate(0,-25%);
-webkit-transition:-webkit-transform .3s ease-out;
-moz-transition:-moz-transform .3s ease-out;
-o-transition:-o-transform .3s ease-out;
transition:transform .3s ease-out
}
.modal.in .modal-dialog {
-webkit-transform:translate(0,0);
-ms-transform:translate(0,0);
-o-transform:translate(0,0);
transform:translate(0,0)
}
.modal-open .modal {
overflow-x:hidden;
overflow-y:auto
}
.modal-dialog {
position:relative;
width:auto;
margin:10px
}
.modal-content {
position:relative;
background-color:#fff;
border:1px solid #999;
border:1px solid rgba(0,0,0,.2);
border-radius:6px;
-webkit-box-shadow:0 3px 9px rgba(0,0,0,.5);
box-shadow:0 3px 9px rgba(0,0,0,.5);
background-clip:padding-box;
outline:0
}
.modal-backdrop {
position:fixed;
top:0;
right:0;
bottom:0;
left:0;
z-index:1040;
background-color:#000
}
.modal-backdrop.fade {
opacity:0;
filter:alpha(opacity=0)
}
.modal-backdrop.in {
opacity:.5;
filter:alpha(opacity=50)
}
.modal-header {
padding:15px;
border-bottom:1px solid #e5e5e5;
min-height:16.42857143px
}
.modal-header .close {
margin-top:-2px
}
.modal-title {
margin:0;
line-height:1.42857143
}
.modal-body {
position:relative;
padding:15px
}
.modal-footer {
padding:15px;
text-align:right;
border-top:1px solid #e5e5e5
}
.modal-footer .btn+.btn {
margin-left:5px;
margin-bottom:0
}
.modal-footer .btn-group .btn+.btn {
margin-left:-1px
}
.modal-footer .btn-block+.btn-block {
margin-left:0
}
.modal-scrollbar-measure {
position:absolute;
top:-9999px;
width:50px;
height:50px;
overflow:scroll
}
@media (min-width:768px) {
.modal-dialog {
 width:600px;
 margin:30px auto
}
.modal-content {
 -webkit-box-shadow:0 5px 15px rgba(0,0,0,.5);
 box-shadow:0 5px 15px rgba(0,0,0,.5)
}
.modal-sm {
 width:300px
}
}
@media (min-width:992px) {
.modal-lg {
 width:900px
}
}
.tooltip {
position:absolute;
z-index:1070;
display:block;
font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;
font-style:normal;
font-weight:400;
letter-spacing:normal;
line-break:auto;
line-height:1.42857143;
text-align:start;
text-decoration:none;
text-shadow:none;
text-transform:none;
white-space:normal;
word-break:normal;
word-spacing:normal;
word-wrap:normal;
font-size:12px;
opacity:0;
filter:alpha(opacity=0)
}
.tooltip.in {
opacity:.9;
filter:alpha(opacity=90)
}
.tooltip.top {
margin-top:-3px;
padding:5px 0
}
.tooltip.right {
margin-left:3px;
padding:0 5px
}
.tooltip.bottom {
margin-top:3px;
padding:5px 0
}
.tooltip.left {
margin-left:-3px;
padding:0 5px
}
.tooltip-inner {
max-width:200px;
padding:3px 8px;
color:#fff;
text-align:center;
background-color:#000;
border-radius:4px
}
.tooltip-arrow {
position:absolute;
width:0;
height:0;
border-color:transparent;
border-style:solid
}
.tooltip.top .tooltip-arrow {
bottom:0;
left:50%;
margin-left:-5px;
border-width:5px 5px 0;
border-top-color:#000
}
.tooltip.top-left .tooltip-arrow {
right:5px
}
.tooltip.top-left .tooltip-arrow,
.tooltip.top-right .tooltip-arrow {
bottom:0;
margin-bottom:-5px;
border-width:5px 5px 0;
border-top-color:#000
}
.tooltip.top-right .tooltip-arrow {
left:5px
}
.tooltip.right .tooltip-arrow {
top:50%;
left:0;
margin-top:-5px;
border-width:5px 5px 5px 0;
border-right-color:#000
}
.tooltip.left .tooltip-arrow {
top:50%;
right:0;
margin-top:-5px;
border-width:5px 0 5px 5px;
border-left-color:#000
}
.tooltip.bottom .tooltip-arrow {
top:0;
left:50%;
margin-left:-5px;
border-width:0 5px 5px;
border-bottom-color:#000
}
.tooltip.bottom-left .tooltip-arrow {
top:0;
right:5px;
margin-top:-5px;
border-width:0 5px 5px;
border-bottom-color:#000
}
.tooltip.bottom-right .tooltip-arrow {
top:0;
left:5px;
margin-top:-5px;
border-width:0 5px 5px;
border-bottom-color:#000
}
.popover {
position:absolute;
top:0;
left:0;
z-index:1060;
display:none;
max-width:276px;
padding:1px;
font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;
font-style:normal;
font-weight:400;
letter-spacing:normal;
line-break:auto;
line-height:1.42857143;
text-align:start;
text-decoration:none;
text-shadow:none;
text-transform:none;
white-space:normal;
word-break:normal;
word-spacing:normal;
word-wrap:normal;
font-size:14px;
background-color:#fff;
background-clip:padding-box;
border:1px solid rgba(0,0,0,.2);
-webkit-box-shadow:0 5px 10px rgba(0,0,0,.2)
}
.popover.top {
margin-top:-10px
}
.popover.right {
margin-left:10px
}
.popover.bottom {
margin-top:10px
}
.popover-title {
margin:0;
padding:8px 14px;
font-size:14px;
background-color:#f7f7f7;
border-bottom:1px solid #ebebeb;
border-radius:5px 5px 0 0
}
.popover-content {
padding:9px 14px
}
.popover>.arrow,
.popover>.arrow:after {
position:absolute;
display:block;
width:0;
height:0;
border-color:transparent;
border-style:solid
}
.popover>.arrow {
border-width:11px
}
.popover>.arrow:after {
border-width:10px;
content:""
}
.popover.top>.arrow {
margin-left:-11px;
border-bottom-width:0;
border-top-color:rgba(0,0,0,.25)
}
.popover.top>.arrow:after {
content:" ";
bottom:1px;
margin-left:-10px;
border-bottom-width:0;
border-top-color:#fff
}
.popover.right>.arrow {
margin-top:-11px;
border-left-width:0;
border-right-color:rgba(0,0,0,.25)
}
.popover.right>.arrow:after {
content:" ";
left:1px;
bottom:-10px;
border-left-width:0;
border-right-color:#fff
}
.popover.bottom>.arrow {
margin-left:-11px;
border-top-width:0;
border-bottom-color:rgba(0,0,0,.25)
}
.popover.bottom>.arrow:after {
content:" ";
top:1px;
margin-left:-10px;
border-top-width:0;
border-bottom-color:#fff
}
.popover.left>.arrow {
margin-top:-11px;
border-right-width:0;
border-left-color:rgba(0,0,0,.25)
}
.popover.left>.arrow:after {
content:" ";
right:1px;
border-right-width:0;
border-left-color:#fff;
bottom:-10px
}
.carousel,
.carousel-inner {
position:relative
}
.carousel-inner {
overflow:hidden;
width:100%
}
.carousel-inner>.item {
display:none;
position:relative;
-webkit-transition:.6s ease-in-out left;
-o-transition:.6s ease-in-out left;
transition:.6s ease-in-out left
}
.carousel-inner>.item>img,
.carousel-inner>.item>a>img {
line-height:1
}
@media all and (transform-3d),(-webkit-transform-3d) {
.carousel-inner>.item {
 -webkit-transition:-webkit-transform .6s ease-in-out;
 -moz-transition:-moz-transform .6s ease-in-out;
 -o-transition:-o-transform .6s ease-in-out;
 transition:transform .6s ease-in-out;
 -webkit-backface-visibility:hidden;
 -moz-backface-visibility:hidden;
 backface-visibility:hidden;
 -webkit-perspective:1000px;
 -moz-perspective:1000px;
 perspective:1000px
}
.carousel-inner>.item.next,
.carousel-inner>.item.active.right {
 -webkit-transform:translate3d(100%,0,0);
 transform:translate3d(100%,0,0);
 left:0
}
.carousel-inner>.item.prev,
.carousel-inner>.item.active.left {
 -webkit-transform:translate3d(-100%,0,0);
 transform:translate3d(-100%,0,0);
 left:0
}
.carousel-inner>.item.next.left,
.carousel-inner>.item.prev.right,
.carousel-inner>.item.active {
 -webkit-transform:translate3d(0,0,0);
 transform:translate3d(0,0,0);
 left:0
}
}
.carousel-inner>.active,
.carousel-inner>.next,
.carousel-inner>.prev {
display:block
}
.carousel-inner>.active {
left:0
}
.carousel-inner>.next,
.carousel-inner>.prev {
position:absolute;
top:0;
width:100%
}
.carousel-inner>.next {
left:100%
}
.carousel-inner>.prev {
left:-100%
}
.carousel-inner>.next.left,
.carousel-inner>.prev.right {
left:0
}
.carousel-inner>.active.left {
left:-100%
}
.carousel-inner>.active.right {
left:100%
}
.carousel-control {
position:absolute;
top:0;
left:0;
bottom:0;
width:15%;
opacity:.5;
filter:alpha(opacity=50);
font-size:20px;
color:#fff;
text-align:center;
text-shadow:0 1px 2px rgba(0,0,0,.6)
}
.carousel-control.left {
background-image:-webkit-linear-gradient(left,rgba(0,0,0,.5)0%,rgba(0,0,0,.0001)100%);
background-image:-o-linear-gradient(left,rgba(0,0,0,.5)0%,rgba(0,0,0,.0001)100%);
background-image:linear-gradient(to right,rgba(0,0,0,.5)0%,rgba(0,0,0,.0001)100%);
background-repeat:repeat-x;
filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1)
}
.carousel-control.right {
left:auto;
right:0;
background-image:-webkit-linear-gradient(left,rgba(0,0,0,.0001)0%,rgba(0,0,0,.5)100%);
background-image:-o-linear-gradient(left,rgba(0,0,0,.0001)0%,rgba(0,0,0,.5)100%);
background-image:linear-gradient(to right,rgba(0,0,0,.0001)0%,rgba(0,0,0,.5)100%);
background-repeat:repeat-x;
filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1)
}
.carousel-control:hover,
.carousel-control:focus {
outline:0;
color:#fff;
text-decoration:none;
opacity:.9;
filter:alpha(opacity=90)
}
.carousel-control .icon-prev,
.carousel-control .icon-next,
.carousel-control .glyphicon-chevron-left,
.carousel-control .glyphicon-chevron-right {
position:absolute;
top:50%;
margin-top:-10px;
z-index:5;
display:inline-block
}
.carousel-control .icon-prev,
.carousel-control .glyphicon-chevron-left {
left:50%;
margin-left:-10px
}
.carousel-control .icon-next,
.carousel-control .glyphicon-chevron-right {
right:50%;
margin-right:-10px
}
.carousel-control .icon-prev,
.carousel-control .icon-next {
width:20px;
height:20px;
line-height:1;
font-family:serif
}
.carousel-control .icon-prev:before {
content:'\2039'
}
.carousel-control .icon-next:before {
content:'\203a'
}
.carousel-indicators {
position:absolute;
bottom:10px;
left:50%;
z-index:15;
width:60%;
margin-left:-30%;
padding-left:0;
list-style:none;
text-align:center
}
.carousel-indicators li {
display:inline-block;
width:10px;
height:10px;
margin:1px;
text-indent:-999px;
border:1px solid #fff;
border-radius:10px;
cursor:pointer;
background-color:#000 \9;
background-color:rgba(0,0,0,0)
}
.carousel-indicators .active {
margin:0;
width:12px;
height:12px;
background-color:#fff
}
.carousel-caption {
position:absolute;
left:15%;
right:15%;
bottom:20px;
z-index:10;
padding-top:20px;
padding-bottom:20px;
color:#fff;
text-align:center;
text-shadow:0 1px 2px rgba(0,0,0,.6)
}
.carousel-caption .btn {
text-shadow:none
}
@media screen and (min-width:768px) {
.carousel-control .glyphicon-chevron-left,
.carousel-control .glyphicon-chevron-right,
.carousel-control .icon-prev,
.carousel-control .icon-next {
 width:30px;
 height:30px;
 margin-top:-15px;
 font-size:30px
}
.carousel-control .glyphicon-chevron-left,
.carousel-control .icon-prev {
 margin-left:-15px
}
.carousel-control .glyphicon-chevron-right,
.carousel-control .icon-next {
 margin-right:-15px
}
.carousel-caption {
 left:20%;
 right:20%;
 padding-bottom:30px
}
.carousel-indicators {
 bottom:20px
}
}
.clearfix:before,
.clearfix:after {
content:" ";
display:table
}
.dl-horizontal dd:before,
.dl-horizontal dd:after {
display:table
}
.container:before,
.container:after,
.container-fluid:before,
.container-fluid:after,
.row:before,
.row:after,
.form-horizontal .form-group:before,
.form-horizontal .form-group:after,
.btn-toolbar:before,
.btn-toolbar:after,
.btn-group-vertical>.btn-group:before,
.btn-group-vertical>.btn-group:after,
.nav:before,
.nav:after,
.navbar:before,
.navbar:after,
.navbar-header:before,
.navbar-header:after,
.navbar-collapse:before,
.navbar-collapse:after,
.pager:before,
.pager:after,
.panel-body:before,
.panel-body:after,
.modal-footer:before,
.modal-footer:after,
.dl-horizontal dd:before,
.dl-horizontal dd:after {
content:" ";
display:table
}
.clearfix:after,
.container:after,
.container-fluid:after,
.row:after,
.form-horizontal .form-group:after,
.btn-toolbar:after,
.btn-group-vertical>.btn-group:after,
.nav:after,
.navbar:after,
.navbar-header:after,
.navbar-collapse:after,
.pager:after,
.panel-body:after,
.modal-footer:after,
.dl-horizontal dd:after {
clear:both
}
.center-block {
display:block;
margin-left:auto;
margin-right:auto
}
.pull-right {
float:right!important
}
.pull-left {
float:left!important
}
.hide {
display:none!important
}
.show {
display:block!important
}
.invisible {
visibility:hidden
}
.text-hide {
font:0/0 a;
color:transparent;
text-shadow:none;
background-color:transparent;
border:0
}
.hidden {
display:none!important
}
.affix {
position:fixed
}
@-ms-viewport {
width:device-width
}
.visible-xs,
.visible-sm,
.visible-md,
.visible-lg,
.visible-xs-block,
.visible-xs-inline,
.visible-xs-inline-block,
.visible-sm-block,
.visible-sm-inline,
.visible-sm-inline-block,
.visible-md-block,
.visible-md-inline,
.visible-md-inline-block,
.visible-lg-block,
.visible-lg-inline,
.visible-lg-inline-block {
display:none!important
}
@media (max-width:767px) {
.visible-xs {
 display:block!important
}
table.visible-xs {
 display:table!important
}
tr.visible-xs {
 display:table-row!important
}
th.visible-xs,
td.visible-xs {
 display:table-cell!important
}
}
@media (max-width:767px) {
.visible-xs-block {
 display:block!important
}
}
@media (max-width:767px) {
.visible-xs-inline {
 display:inline!important
}
}
@media (max-width:767px) {
.visible-xs-inline-block {
 display:inline-block!important
}
}
@media (min-width:768px) and (max-width:991px) {
.visible-sm {
 display:block!important
}
table.visible-sm {
 display:table!important
}
tr.visible-sm {
 display:table-row!important
}
th.visible-sm,
td.visible-sm {
 display:table-cell!important
}
}
@media (min-width:768px) and (max-width:991px) {
.visible-sm-block {
 display:block!important
}
}
@media (min-width:768px) and (max-width:991px) {
.visible-sm-inline {
 display:inline!important
}
}
@media (min-width:768px) and (max-width:991px) {
.visible-sm-inline-block {
 display:inline-block!important
}
}
@media (min-width:992px) and (max-width:1199px) {
.visible-md {
 display:block!important
}
table.visible-md {
 display:table!important
}
tr.visible-md {
 display:table-row!important
}
th.visible-md,
td.visible-md {
 display:table-cell!important
}
}
@media (min-width:992px) and (max-width:1199px) {
.visible-md-block {
 display:block!important
}
}
@media (min-width:992px) and (max-width:1199px) {
.visible-md-inline {
 display:inline!important
}
}
@media (min-width:992px) and (max-width:1199px) {
.visible-md-inline-block {
 display:inline-block!important
}
}
@media (min-width:1200px) {
.visible-lg {
 display:block!important
}
table.visible-lg {
 display:table!important
}
tr.visible-lg {
 display:table-row!important
}
th.visible-lg,
td.visible-lg {
 display:table-cell!important
}
}
@media (min-width:1200px) {
.visible-lg-block {
 display:block!important
}
}
@media (min-width:1200px) {
.visible-lg-inline {
 display:inline!important
}
}
@media (min-width:1200px) {
.visible-lg-inline-block {
 display:inline-block!important
}
}
@media (max-width:767px) {
.hidden-xs {
 display:none!important
}
}
@media (min-width:768px) and (max-width:991px) {
.hidden-sm {
 display:none!important
}
}
@media (min-width:992px) and (max-width:1199px) {
.hidden-md {
 display:none!important
}
}
@media (min-width:1200px) {
.hidden-lg {
 display:none!important
}
}
.visible-print {
display:none!important
}
@media print {
.visible-print {
 display:block!important
}
table.visible-print {
 display:table!important
}
tr.visible-print {
 display:table-row!important
}
th.visible-print,
td.visible-print {
 display:table-cell!important
}
}
.visible-print-block {
display:none!important
}
@media print {
.visible-print-block {
 display:block!important
}
}
.visible-print-inline {
display:none!important
}
@media print {
.visible-print-inline {
 display:inline!important
}
}
.visible-print-inline-block {
display:none!important
}
@media print {
.visible-print-inline-block {
 display:inline-block!important
}
}
@media print {
.hidden-print {
 display:none!important
}
}
@font-face {
font-family:'FontAwesome';
src:url('/bower_components/font-awesome/fonts/fontawesome-webfont.eot?v=4.4.0');
src:url('/bower_components/font-awesome/fonts/fontawesome-webfont.eot?#iefix&v=4.4.0') format('embedded-opentype'),
url('/bower_components/font-awesome/fonts/fontawesome-webfont.woff2?v=4.4.0') format('woff2'),
url('/bower_components/font-awesome/fonts/fontawesome-webfont.woff?v=4.4.0') format('woff'),
url('/bower_components/font-awesome/fonts/fontawesome-webfont.ttf?v=4.4.0') format('truetype'),
url('/bower_components/font-awesome/fonts/fontawesome-webfont.svg?v=4.4.0#fontawesomeregular') format('svg');
font-weight:400;
font-style:normal
}
.fa {
display:inline-block;
font:14px/1 FontAwesome;
font-size:inherit;
text-rendering:auto;
-webkit-font-smoothing:antialiased;
-moz-osx-font-smoothing:grayscale
}
.fa-lg {
font-size:1.33333333em;
line-height:.75em;
vertical-align:-15%
}
.fa-2x {
font-size:2em
}
.fa-3x {
font-size:3em
}
.fa-4x {
font-size:4em
}
.fa-5x {
font-size:5em
}
.fa-fw {
width:1.28571429em;
text-align:center
}
.fa-ul {
padding-left:0;
margin-left:2.14285714em;
list-style-type:none
}
.fa-ul>li {
position:relative
}
.fa-li {
position:absolute;
left:-2.14285714em;
width:2.14285714em;
top:.14285714em;
text-align:center
}
.fa-li.fa-lg {
left:-1.85714286em
}
.fa-border {
padding:.2em .25em .15em;
border:solid .08em #eee;
border-radius:.1em
}
.fa-pull-left {
float:left
}
.fa-pull-right {
float:right
}
.fa.fa-pull-left {
margin-right:.3em
}
.fa.fa-pull-right {
margin-left:.3em
}
.fa.pull-left {
margin-right:.3em
}
.fa.pull-right {
margin-left:.3em
}
.fa-spin {
-webkit-animation:fa-spin 2s infinite linear;
animation:fa-spin 2s infinite linear
}
.fa-pulse {
-webkit-animation:fa-spin 1s infinite steps(8);
animation:fa-spin 1s infinite steps(8)
}
@-webkit-keyframes fa-spin {
0% {
 -webkit-transform:rotate(0deg);
 transform:rotate(0deg)
}
100% {
 -webkit-transform:rotate(359deg);
 transform:rotate(359deg)
}
}
@keyframes fa-spin {
0% {
 -webkit-transform:rotate(0deg);
 transform:rotate(0deg)
}
100% {
 -webkit-transform:rotate(359deg);
 transform:rotate(359deg)
}
}
.fa-rotate-90 {
filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=1);
-webkit-transform:rotate(90deg);
-ms-transform:rotate(90deg);
transform:rotate(90deg)
}
.fa-rotate-180 {
filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2);
-webkit-transform:rotate(180deg);
-ms-transform:rotate(180deg);
transform:rotate(180deg)
}
.fa-rotate-270 {
filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=3);
-webkit-transform:rotate(270deg);
-ms-transform:rotate(270deg);
transform:rotate(270deg)
}
.fa-flip-horizontal {
filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1);
-webkit-transform:scale(-1,1);
-ms-transform:scale(-1,1);
transform:scale(-1,1)
}
.fa-flip-vertical {
filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1);
-webkit-transform:scale(1,-1);
-ms-transform:scale(1,-1);
transform:scale(1,-1)
}
:root .fa-rotate-90,
:root .fa-rotate-180,
:root .fa-rotate-270,
:root .fa-flip-horizontal,
:root .fa-flip-vertical {
filter:none
}
.fa-stack {
position:relative;
display:inline-block;
width:2em;
height:2em;
line-height:2em;
vertical-align:middle
}
.fa-stack-1x,
.fa-stack-2x {
position:absolute;
left:0;
width:100%;
text-align:center
}
.fa-stack-1x {
line-height:inherit
}
.fa-stack-2x {
font-size:2em
}
.fa-inverse {
color:#fff
}
.fa-glass:before {
content:"\f000"
}
.fa-music:before {
content:"\f001"
}
.fa-search:before {
content:"\f002"
}
.fa-envelope-o:before {
content:"\f003"
}
.fa-heart:before {
content:"\f004"
}
.fa-star:before {
content:"\f005"
}
.fa-star-o:before {
content:"\f006"
}
.fa-user:before {
content:"\f007"
}
.fa-film:before {
content:"\f008"
}
.fa-th-large:before {
content:"\f009"
}
.fa-th:before {
content:"\f00a"
}
.fa-th-list:before {
content:"\f00b"
}
.fa-check:before {
content:"\f00c"
}
.fa-remove:before,
.fa-close:before,
.fa-times:before {
content:"\f00d"
}
.fa-search-plus:before {
content:"\f00e"
}
.fa-search-minus:before {
content:"\f010"
}
.fa-power-off:before {
content:"\f011"
}
.fa-signal:before {
content:"\f012"
}
.fa-gear:before,
.fa-cog:before {
content:"\f013"
}
.fa-trash-o:before {
content:"\f014"
}
.fa-home:before {
content:"\f015"
}
.fa-file-o:before {
content:"\f016"
}
.fa-clock-o:before {
content:"\f017"
}
.fa-road:before {
content:"\f018"
}
.fa-download:before {
content:"\f019"
}
.fa-arrow-circle-o-down:before {
content:"\f01a"
}
.fa-arrow-circle-o-up:before {
content:"\f01b"
}
.fa-inbox:before {
content:"\f01c"
}
.fa-play-circle-o:before {
content:"\f01d"
}
.fa-rotate-right:before,
.fa-repeat:before {
content:"\f01e"
}
.fa-refresh:before {
content:"\f021"
}
.fa-list-alt:before {
content:"\f022"
}
.fa-lock:before {
content:"\f023"
}
.fa-flag:before {
content:"\f024"
}
.fa-headphones:before {
content:"\f025"
}
.fa-volume-off:before {
content:"\f026"
}
.fa-volume-down:before {
content:"\f027"
}
.fa-volume-up:before {
content:"\f028"
}
.fa-qrcode:before {
content:"\f029"
}
.fa-barcode:before {
content:"\f02a"
}
.fa-tag:before {
content:"\f02b"
}
.fa-tags:before {
content:"\f02c"
}
.fa-book:before {
content:"\f02d"
}
.fa-bookmark:before {
content:"\f02e"
}
.fa-print:before {
content:"\f02f"
}
.fa-camera:before {
content:"\f030"
}
.fa-font:before {
content:"\f031"
}
.fa-bold:before {
content:"\f032"
}
.fa-italic:before {
content:"\f033"
}
.fa-text-height:before {
content:"\f034"
}
.fa-text-width:before {
content:"\f035"
}
.fa-align-left:before {
content:"\f036"
}
.fa-align-center:before {
content:"\f037"
}
.fa-align-right:before {
content:"\f038"
}
.fa-align-justify:before {
content:"\f039"
}
.fa-list:before {
content:"\f03a"
}
.fa-dedent:before,
.fa-outdent:before {
content:"\f03b"
}
.fa-indent:before {
content:"\f03c"
}
.fa-video-camera:before {
content:"\f03d"
}
.fa-photo:before,
.fa-image:before,
.fa-picture-o:before {
content:"\f03e"
}
.fa-pencil:before {
content:"\f040"
}
.fa-map-marker:before {
content:"\f041"
}
.fa-adjust:before {
content:"\f042"
}
.fa-tint:before {
content:"\f043"
}
.fa-edit:before,
.fa-pencil-square-o:before {
content:"\f044"
}
.fa-share-square-o:before {
content:"\f045"
}
.fa-check-square-o:before {
content:"\f046"
}
.fa-arrows:before {
content:"\f047"
}
.fa-step-backward:before {
content:"\f048"
}
.fa-fast-backward:before {
content:"\f049"
}
.fa-backward:before {
content:"\f04a"
}
.fa-play:before {
content:"\f04b"
}
.fa-pause:before {
content:"\f04c"
}
.fa-stop:before {
content:"\f04d"
}
.fa-forward:before {
content:"\f04e"
}
.fa-fast-forward:before {
content:"\f050"
}
.fa-step-forward:before {
content:"\f051"
}
.fa-eject:before {
content:"\f052"
}
.fa-chevron-left:before {
content:"\f053"
}
.fa-chevron-right:before {
content:"\f054"
}
.fa-plus-circle:before {
content:"\f055"
}
.fa-minus-circle:before {
content:"\f056"
}
.fa-times-circle:before {
content:"\f057"
}
.fa-check-circle:before {
content:"\f058"
}
.fa-question-circle:before {
content:"\f059"
}
.fa-info-circle:before {
content:"\f05a"
}
.fa-crosshairs:before {
content:"\f05b"
}
.fa-times-circle-o:before {
content:"\f05c"
}
.fa-check-circle-o:before {
content:"\f05d"
}
.fa-ban:before {
content:"\f05e"
}
.fa-arrow-left:before {
content:"\f060"
}
.fa-arrow-right:before {
content:"\f061"
}
.fa-arrow-up:before {
content:"\f062"
}
.fa-arrow-down:before {
content:"\f063"
}
.fa-mail-forward:before,
.fa-share:before {
content:"\f064"
}
.fa-expand:before {
content:"\f065"
}
.fa-compress:before {
content:"\f066"
}
.fa-plus:before {
content:"\f067"
}
.fa-minus:before {
content:"\f068"
}
.fa-asterisk:before {
content:"\f069"
}
.fa-exclamation-circle:before {
content:"\f06a"
}
.fa-gift:before {
content:"\f06b"
}
.fa-leaf:before {
content:"\f06c"
}
.fa-fire:before {
content:"\f06d"
}
.fa-eye:before {
content:"\f06e"
}
.fa-eye-slash:before {
content:"\f070"
}
.fa-warning:before,
.fa-exclamation-triangle:before {
content:"\f071"
}
.fa-plane:before {
content:"\f072"
}
.fa-calendar:before {
content:"\f073"
}
.fa-random:before {
content:"\f074"
}
.fa-comment:before {
content:"\f075"
}
.fa-magnet:before {
content:"\f076"
}
.fa-chevron-up:before {
content:"\f077"
}
.fa-chevron-down:before {
content:"\f078"
}
.fa-retweet:before {
content:"\f079"
}
.fa-shopping-cart:before {
content:"\f07a"
}
.fa-folder:before {
content:"\f07b"
}
.fa-folder-open:before {
content:"\f07c"
}
.fa-arrows-v:before {
content:"\f07d"
}
.fa-arrows-h:before {
content:"\f07e"
}
.fa-bar-chart-o:before,
.fa-bar-chart:before {
content:"\f080"
}
.fa-twitter-square:before {
content:"\f081"
}
.fa-facebook-square:before {
content:"\f082"
}
.fa-camera-retro:before {
content:"\f083"
}
.fa-key:before {
content:"\f084"
}
.fa-gears:before,
.fa-cogs:before {
content:"\f085"
}
.fa-comments:before {
content:"\f086"
}
.fa-thumbs-o-up:before {
content:"\f087"
}
.fa-thumbs-o-down:before {
content:"\f088"
}
.fa-star-half:before {
content:"\f089"
}
.fa-heart-o:before {
content:"\f08a"
}
.fa-sign-out:before {
content:"\f08b"
}
.fa-linkedin-square:before {
content:"\f08c"
}
.fa-thumb-tack:before {
content:"\f08d"
}
.fa-external-link:before {
content:"\f08e"
}
.fa-sign-in:before {
content:"\f090"
}
.fa-trophy:before {
content:"\f091"
}
.fa-github-square:before {
content:"\f092"
}
.fa-upload:before {
content:"\f093"
}
.fa-lemon-o:before {
content:"\f094"
}
.fa-phone:before {
content:"\f095"
}
.fa-square-o:before {
content:"\f096"
}
.fa-bookmark-o:before {
content:"\f097"
}
.fa-phone-square:before {
content:"\f098"
}
.fa-twitter:before {
content:"\f099"
}
.fa-facebook-f:before,
.fa-facebook:before {
content:"\f09a"
}
.fa-github:before {
content:"\f09b"
}
.fa-unlock:before {
content:"\f09c"
}
.fa-credit-card:before {
content:"\f09d"
}
.fa-feed:before,
.fa-rss:before {
content:"\f09e"
}
.fa-hdd-o:before {
content:"\f0a0"
}
.fa-bullhorn:before {
content:"\f0a1"
}
.fa-bell:before {
content:"\f0f3"
}
.fa-certificate:before {
content:"\f0a3"
}
.fa-hand-o-right:before {
content:"\f0a4"
}
.fa-hand-o-left:before {
content:"\f0a5"
}
.fa-hand-o-up:before {
content:"\f0a6"
}
.fa-hand-o-down:before {
content:"\f0a7"
}
.fa-arrow-circle-left:before {
content:"\f0a8"
}
.fa-arrow-circle-right:before {
content:"\f0a9"
}
.fa-arrow-circle-up:before {
content:"\f0aa"
}
.fa-arrow-circle-down:before {
content:"\f0ab"
}
.fa-globe:before {
content:"\f0ac"
}
.fa-wrench:before {
content:"\f0ad"
}
.fa-tasks:before {
content:"\f0ae"
}
.fa-filter:before {
content:"\f0b0"
}
.fa-briefcase:before {
content:"\f0b1"
}
.fa-arrows-alt:before {
content:"\f0b2"
}
.fa-group:before,
.fa-users:before {
content:"\f0c0"
}
.fa-chain:before,
.fa-link:before {
content:"\f0c1"
}
.fa-cloud:before {
content:"\f0c2"
}
.fa-flask:before {
content:"\f0c3"
}
.fa-cut:before,
.fa-scissors:before {
content:"\f0c4"
}
.fa-copy:before,
.fa-files-o:before {
content:"\f0c5"
}
.fa-paperclip:before {
content:"\f0c6"
}
.fa-save:before,
.fa-floppy-o:before {
content:"\f0c7"
}
.fa-square:before {
content:"\f0c8"
}
.fa-navicon:before,
.fa-reorder:before,
.fa-bars:before {
content:"\f0c9"
}
.fa-list-ul:before {
content:"\f0ca"
}
.fa-list-ol:before {
content:"\f0cb"
}
.fa-strikethrough:before {
content:"\f0cc"
}
.fa-underline:before {
content:"\f0cd"
}
.fa-table:before {
content:"\f0ce"
}
.fa-magic:before {
content:"\f0d0"
}
.fa-truck:before {
content:"\f0d1"
}
.fa-pinterest:before {
content:"\f0d2"
}
.fa-pinterest-square:before {
content:"\f0d3"
}
.fa-google-plus-square:before {
content:"\f0d4"
}
.fa-google-plus:before {
content:"\f0d5"
}
.fa-money:before {
content:"\f0d6"
}
.fa-caret-down:before {
content:"\f0d7"
}
.fa-caret-up:before {
content:"\f0d8"
}
.fa-caret-left:before {
content:"\f0d9"
}
.fa-caret-right:before {
content:"\f0da"
}
.fa-columns:before {
content:"\f0db"
}
.fa-unsorted:before,
.fa-sort:before {
content:"\f0dc"
}
.fa-sort-down:before,
.fa-sort-desc:before {
content:"\f0dd"
}
.fa-sort-up:before,
.fa-sort-asc:before {
content:"\f0de"
}
.fa-envelope:before {
content:"\f0e0"
}
.fa-linkedin:before {
content:"\f0e1"
}
.fa-rotate-left:before,
.fa-undo:before {
content:"\f0e2"
}
.fa-legal:before,
.fa-gavel:before {
content:"\f0e3"
}
.fa-dashboard:before,
.fa-tachometer:before {
content:"\f0e4"
}
.fa-comment-o:before {
content:"\f0e5"
}
.fa-comments-o:before {
content:"\f0e6"
}
.fa-flash:before,
.fa-bolt:before {
content:"\f0e7"
}
.fa-sitemap:before {
content:"\f0e8"
}
.fa-umbrella:before {
content:"\f0e9"
}
.fa-paste:before,
.fa-clipboard:before {
content:"\f0ea"
}
.fa-lightbulb-o:before {
content:"\f0eb"
}
.fa-exchange:before {
content:"\f0ec"
}
.fa-cloud-download:before {
content:"\f0ed"
}
.fa-cloud-upload:before {
content:"\f0ee"
}
.fa-user-md:before {
content:"\f0f0"
}
.fa-stethoscope:before {
content:"\f0f1"
}
.fa-suitcase:before {
content:"\f0f2"
}
.fa-bell-o:before {
content:"\f0a2"
}
.fa-coffee:before {
content:"\f0f4"
}
.fa-cutlery:before {
content:"\f0f5"
}
.fa-file-text-o:before {
content:"\f0f6"
}
.fa-building-o:before {
content:"\f0f7"
}
.fa-hospital-o:before {
content:"\f0f8"
}
.fa-ambulance:before {
content:"\f0f9"
}
.fa-medkit:before {
content:"\f0fa"
}
.fa-fighter-jet:before {
content:"\f0fb"
}
.fa-beer:before {
content:"\f0fc"
}
.fa-h-square:before {
content:"\f0fd"
}
.fa-plus-square:before {
content:"\f0fe"
}
.fa-angle-double-left:before {
content:"\f100"
}
.fa-angle-double-right:before {
content:"\f101"
}
.fa-angle-double-up:before {
content:"\f102"
}
.fa-angle-double-down:before {
content:"\f103"
}
.fa-angle-left:before {
content:"\f104"
}
.fa-angle-right:before {
content:"\f105"
}
.fa-angle-up:before {
content:"\f106"
}
.fa-angle-down:before {
content:"\f107"
}
.fa-desktop:before {
content:"\f108"
}
.fa-laptop:before {
content:"\f109"
}
.fa-tablet:before {
content:"\f10a"
}
.fa-mobile-phone:before,
.fa-mobile:before {
content:"\f10b"
}
.fa-circle-o:before {
content:"\f10c"
}
.fa-quote-left:before {
content:"\f10d"
}
.fa-quote-right:before {
content:"\f10e"
}
.fa-spinner:before {
content:"\f110"
}
.fa-circle:before {
content:"\f111"
}
.fa-mail-reply:before,
.fa-reply:before {
content:"\f112"
}
.fa-github-alt:before {
content:"\f113"
}
.fa-folder-o:before {
content:"\f114"
}
.fa-folder-open-o:before {
content:"\f115"
}
.fa-smile-o:before {
content:"\f118"
}
.fa-frown-o:before {
content:"\f119"
}
.fa-meh-o:before {
content:"\f11a"
}
.fa-gamepad:before {
content:"\f11b"
}
.fa-keyboard-o:before {
content:"\f11c"
}
.fa-flag-o:before {
content:"\f11d"
}
.fa-flag-checkered:before {
content:"\f11e"
}
.fa-terminal:before {
content:"\f120"
}
.fa-code:before {
content:"\f121"
}
.fa-mail-reply-all:before,
.fa-reply-all:before {
content:"\f122"
}
.fa-star-half-empty:before,
.fa-star-half-full:before,
.fa-star-half-o:before {
content:"\f123"
}
.fa-location-arrow:before {
content:"\f124"
}
.fa-crop:before {
content:"\f125"
}
.fa-code-fork:before {
content:"\f126"
}
.fa-unlink:before,
.fa-chain-broken:before {
content:"\f127"
}
.fa-question:before {
content:"\f128"
}
.fa-info:before {
content:"\f129"
}
.fa-exclamation:before {
content:"\f12a"
}
.fa-superscript:before {
content:"\f12b"
}
.fa-subscript:before {
content:"\f12c"
}
.fa-eraser:before {
content:"\f12d"
}
.fa-puzzle-piece:before {
content:"\f12e"
}
.fa-microphone:before {
content:"\f130"
}
.fa-microphone-slash:before {
content:"\f131"
}
.fa-shield:before {
content:"\f132"
}
.fa-calendar-o:before {
content:"\f133"
}
.fa-fire-extinguisher:before {
content:"\f134"
}
.fa-rocket:before {
content:"\f135"
}
.fa-maxcdn:before {
content:"\f136"
}
.fa-chevron-circle-left:before {
content:"\f137"
}
.fa-chevron-circle-right:before {
content:"\f138"
}
.fa-chevron-circle-up:before {
content:"\f139"
}
.fa-chevron-circle-down:before {
content:"\f13a"
}
.fa-html5:before {
content:"\f13b"
}
.fa-css3:before {
content:"\f13c"
}
.fa-anchor:before {
content:"\f13d"
}
.fa-unlock-alt:before {
content:"\f13e"
}
.fa-bullseye:before {
content:"\f140"
}
.fa-ellipsis-h:before {
content:"\f141"
}
.fa-ellipsis-v:before {
content:"\f142"
}
.fa-rss-square:before {
content:"\f143"
}
.fa-play-circle:before {
content:"\f144"
}
.fa-ticket:before {
content:"\f145"
}
.fa-minus-square:before {
content:"\f146"
}
.fa-minus-square-o:before {
content:"\f147"
}
.fa-level-up:before {
content:"\f148"
}
.fa-level-down:before {
content:"\f149"
}
.fa-check-square:before {
content:"\f14a"
}
.fa-pencil-square:before {
content:"\f14b"
}
.fa-external-link-square:before {
content:"\f14c"
}
.fa-share-square:before {
content:"\f14d"
}
.fa-compass:before {
content:"\f14e"
}
.fa-toggle-down:before,
.fa-caret-square-o-down:before {
content:"\f150"
}
.fa-toggle-up:before,
.fa-caret-square-o-up:before {
content:"\f151"
}
.fa-toggle-right:before,
.fa-caret-square-o-right:before {
content:"\f152"
}
.fa-euro:before,
.fa-eur:before {
content:"\f153"
}
.fa-gbp:before {
content:"\f154"
}
.fa-dollar:before,
.fa-usd:before {
content:"\f155"
}
.fa-rupee:before,
.fa-inr:before {
content:"\f156"
}
.fa-cny:before,
.fa-rmb:before,
.fa-yen:before,
.fa-jpy:before {
content:"\f157"
}
.fa-ruble:before,
.fa-rouble:before,
.fa-rub:before {
content:"\f158"
}
.fa-won:before,
.fa-krw:before {
content:"\f159"
}
.fa-bitcoin:before,
.fa-btc:before {
content:"\f15a"
}
.fa-file:before {
content:"\f15b"
}
.fa-file-text:before {
content:"\f15c"
}
.fa-sort-alpha-asc:before {
content:"\f15d"
}
.fa-sort-alpha-desc:before {
content:"\f15e"
}
.fa-sort-amount-asc:before {
content:"\f160"
}
.fa-sort-amount-desc:before {
content:"\f161"
}
.fa-sort-numeric-asc:before {
content:"\f162"
}
.fa-sort-numeric-desc:before {
content:"\f163"
}
.fa-thumbs-up:before {
content:"\f164"
}
.fa-thumbs-down:before {
content:"\f165"
}
.fa-youtube-square:before {
content:"\f166"
}
.fa-youtube:before {
content:"\f167"
}
.fa-xing:before {
content:"\f168"
}
.fa-xing-square:before {
content:"\f169"
}
.fa-youtube-play:before {
content:"\f16a"
}
.fa-dropbox:before {
content:"\f16b"
}
.fa-stack-overflow:before {
content:"\f16c"
}
.fa-instagram:before {
content:"\f16d"
}
.fa-flickr:before {
content:"\f16e"
}
.fa-adn:before {
content:"\f170"
}
.fa-bitbucket:before {
content:"\f171"
}
.fa-bitbucket-square:before {
content:"\f172"
}
.fa-tumblr:before {
content:"\f173"
}
.fa-tumblr-square:before {
content:"\f174"
}
.fa-long-arrow-down:before {
content:"\f175"
}
.fa-long-arrow-up:before {
content:"\f176"
}
.fa-long-arrow-left:before {
content:"\f177"
}
.fa-long-arrow-right:before {
content:"\f178"
}
.fa-apple:before {
content:"\f179"
}
.fa-windows:before {
content:"\f17a"
}
.fa-android:before {
content:"\f17b"
}
.fa-linux:before {
content:"\f17c"
}
.fa-dribbble:before {
content:"\f17d"
}
.fa-skype:before {
content:"\f17e"
}
.fa-foursquare:before {
content:"\f180"
}
.fa-trello:before {
content:"\f181"
}
.fa-female:before {
content:"\f182"
}
.fa-male:before {
content:"\f183"
}
.fa-gittip:before,
.fa-gratipay:before {
content:"\f184"
}
.fa-sun-o:before {
content:"\f185"
}
.fa-moon-o:before {
content:"\f186"
}
.fa-archive:before {
content:"\f187"
}
.fa-bug:before {
content:"\f188"
}
.fa-vk:before {
content:"\f189"
}
.fa-weibo:before {
content:"\f18a"
}
.fa-renren:before {
content:"\f18b"
}
.fa-pagelines:before {
content:"\f18c"
}
.fa-stack-exchange:before {
content:"\f18d"
}
.fa-arrow-circle-o-right:before {
content:"\f18e"
}
.fa-arrow-circle-o-left:before {
content:"\f190"
}
.fa-toggle-left:before,
.fa-caret-square-o-left:before {
content:"\f191"
}
.fa-dot-circle-o:before {
content:"\f192"
}
.fa-wheelchair:before {
content:"\f193"
}
.fa-vimeo-square:before {
content:"\f194"
}
.fa-turkish-lira:before,
.fa-try:before {
content:"\f195"
}
.fa-plus-square-o:before {
content:"\f196"
}
.fa-space-shuttle:before {
content:"\f197"
}
.fa-slack:before {
content:"\f198"
}
.fa-envelope-square:before {
content:"\f199"
}
.fa-wordpress:before {
content:"\f19a"
}
.fa-openid:before {
content:"\f19b"
}
.fa-institution:before,
.fa-bank:before,
.fa-university:before {
content:"\f19c"
}
.fa-mortar-board:before,
.fa-graduation-cap:before {
content:"\f19d"
}
.fa-yahoo:before {
content:"\f19e"
}
.fa-google:before {
content:"\f1a0"
}
.fa-reddit:before {
content:"\f1a1"
}
.fa-reddit-square:before {
content:"\f1a2"
}
.fa-stumbleupon-circle:before {
content:"\f1a3"
}
.fa-stumbleupon:before {
content:"\f1a4"
}
.fa-delicious:before {
content:"\f1a5"
}
.fa-digg:before {
content:"\f1a6"
}
.fa-pied-piper:before {
content:"\f1a7"
}
.fa-pied-piper-alt:before {
content:"\f1a8"
}
.fa-drupal:before {
content:"\f1a9"
}
.fa-joomla:before {
content:"\f1aa"
}
.fa-language:before {
content:"\f1ab"
}
.fa-fax:before {
content:"\f1ac"
}
.fa-building:before {
content:"\f1ad"
}
.fa-child:before {
content:"\f1ae"
}
.fa-paw:before {
content:"\f1b0"
}
.fa-spoon:before {
content:"\f1b1"
}
.fa-cube:before {
content:"\f1b2"
}
.fa-cubes:before {
content:"\f1b3"
}
.fa-behance:before {
content:"\f1b4"
}
.fa-behance-square:before {
content:"\f1b5"
}
.fa-steam:before {
content:"\f1b6"
}
.fa-steam-square:before {
content:"\f1b7"
}
.fa-recycle:before {
content:"\f1b8"
}
.fa-automobile:before,
.fa-car:before {
content:"\f1b9"
}
.fa-cab:before,
.fa-taxi:before {
content:"\f1ba"
}
.fa-tree:before {
content:"\f1bb"
}
.fa-spotify:before {
content:"\f1bc"
}
.fa-deviantart:before {
content:"\f1bd"
}
.fa-soundcloud:before {
content:"\f1be"
}
.fa-database:before {
content:"\f1c0"
}
.fa-file-pdf-o:before {
content:"\f1c1"
}
.fa-file-word-o:before {
content:"\f1c2"
}
.fa-file-excel-o:before {
content:"\f1c3"
}
.fa-file-powerpoint-o:before {
content:"\f1c4"
}
.fa-file-photo-o:before,
.fa-file-picture-o:before,
.fa-file-image-o:before {
content:"\f1c5"
}
.fa-file-zip-o:before,
.fa-file-archive-o:before {
content:"\f1c6"
}
.fa-file-sound-o:before,
.fa-file-audio-o:before {
content:"\f1c7"
}
.fa-file-movie-o:before,
.fa-file-video-o:before {
content:"\f1c8"
}
.fa-file-code-o:before {
content:"\f1c9"
}
.fa-vine:before {
content:"\f1ca"
}
.fa-codepen:before {
content:"\f1cb"
}
.fa-jsfiddle:before {
content:"\f1cc"
}
.fa-life-bouy:before,
.fa-life-buoy:before,
.fa-life-saver:before,
.fa-support:before,
.fa-life-ring:before {
content:"\f1cd"
}
.fa-circle-o-notch:before {
content:"\f1ce"
}
.fa-ra:before,
.fa-rebel:before {
content:"\f1d0"
}
.fa-ge:before,
.fa-empire:before {
content:"\f1d1"
}
.fa-git-square:before {
content:"\f1d2"
}
.fa-git:before {
content:"\f1d3"
}
.fa-y-combinator-square:before,
.fa-yc-square:before,
.fa-hacker-news:before {
content:"\f1d4"
}
.fa-tencent-weibo:before {
content:"\f1d5"
}
.fa-qq:before {
content:"\f1d6"
}
.fa-wechat:before,
.fa-weixin:before {
content:"\f1d7"
}
.fa-send:before,
.fa-paper-plane:before {
content:"\f1d8"
}
.fa-send-o:before,
.fa-paper-plane-o:before {
content:"\f1d9"
}
.fa-history:before {
content:"\f1da"
}
.fa-circle-thin:before {
content:"\f1db"
}
.fa-header:before {
content:"\f1dc"
}
.fa-paragraph:before {
content:"\f1dd"
}
.fa-sliders:before {
content:"\f1de"
}
.fa-share-alt:before {
content:"\f1e0"
}
.fa-share-alt-square:before {
content:"\f1e1"
}
.fa-bomb:before {
content:"\f1e2"
}
.fa-soccer-ball-o:before,
.fa-futbol-o:before {
content:"\f1e3"
}
.fa-tty:before {
content:"\f1e4"
}
.fa-binoculars:before {
content:"\f1e5"
}
.fa-plug:before {
content:"\f1e6"
}
.fa-slideshare:before {
content:"\f1e7"
}
.fa-twitch:before {
content:"\f1e8"
}
.fa-yelp:before {
content:"\f1e9"
}
.fa-newspaper-o:before {
content:"\f1ea"
}
.fa-wifi:before {
content:"\f1eb"
}
.fa-calculator:before {
content:"\f1ec"
}
.fa-paypal:before {
content:"\f1ed"
}
.fa-google-wallet:before {
content:"\f1ee"
}
.fa-cc-visa:before {
content:"\f1f0"
}
.fa-cc-mastercard:before {
content:"\f1f1"
}
.fa-cc-discover:before {
content:"\f1f2"
}
.fa-cc-amex:before {
content:"\f1f3"
}
.fa-cc-paypal:before {
content:"\f1f4"
}
.fa-cc-stripe:before {
content:"\f1f5"
}
.fa-bell-slash:before {
content:"\f1f6"
}
.fa-bell-slash-o:before {
content:"\f1f7"
}
.fa-trash:before {
content:"\f1f8"
}
.fa-copyright:before {
content:"\f1f9"
}
.fa-at:before {
content:"\f1fa"
}
.fa-eyedropper:before {
content:"\f1fb"
}
.fa-paint-brush:before {
content:"\f1fc"
}
.fa-birthday-cake:before {
content:"\f1fd"
}
.fa-area-chart:before {
content:"\f1fe"
}
.fa-pie-chart:before {
content:"\f200"
}
.fa-line-chart:before {
content:"\f201"
}
.fa-lastfm:before {
content:"\f202"
}
.fa-lastfm-square:before {
content:"\f203"
}
.fa-toggle-off:before {
content:"\f204"
}
.fa-toggle-on:before {
content:"\f205"
}
.fa-bicycle:before {
content:"\f206"
}
.fa-bus:before {
content:"\f207"
}
.fa-ioxhost:before {
content:"\f208"
}
.fa-angellist:before {
content:"\f209"
}
.fa-cc:before {
content:"\f20a"
}
.fa-shekel:before,
.fa-sheqel:before,
.fa-ils:before {
content:"\f20b"
}
.fa-meanpath:before {
content:"\f20c"
}
.fa-buysellads:before {
content:"\f20d"
}
.fa-connectdevelop:before {
content:"\f20e"
}
.fa-dashcube:before {
content:"\f210"
}
.fa-forumbee:before {
content:"\f211"
}
.fa-leanpub:before {
content:"\f212"
}
.fa-sellsy:before {
content:"\f213"
}
.fa-shirtsinbulk:before {
content:"\f214"
}
.fa-simplybuilt:before {
content:"\f215"
}
.fa-skyatlas:before {
content:"\f216"
}
.fa-cart-plus:before {
content:"\f217"
}
.fa-cart-arrow-down:before {
content:"\f218"
}
.fa-diamond:before {
content:"\f219"
}
.fa-ship:before {
content:"\f21a"
}
.fa-user-secret:before {
content:"\f21b"
}
.fa-motorcycle:before {
content:"\f21c"
}
.fa-street-view:before {
content:"\f21d"
}
.fa-heartbeat:before {
content:"\f21e"
}
.fa-venus:before {
content:"\f221"
}
.fa-mars:before {
content:"\f222"
}
.fa-mercury:before {
content:"\f223"
}
.fa-intersex:before,
.fa-transgender:before {
content:"\f224"
}
.fa-transgender-alt:before {
content:"\f225"
}
.fa-venus-double:before {
content:"\f226"
}
.fa-mars-double:before {
content:"\f227"
}
.fa-venus-mars:before {
content:"\f228"
}
.fa-mars-stroke:before {
content:"\f229"
}
.fa-mars-stroke-v:before {
content:"\f22a"
}
.fa-mars-stroke-h:before {
content:"\f22b"
}
.fa-neuter:before {
content:"\f22c"
}
.fa-genderless:before {
content:"\f22d"
}
.fa-facebook-official:before {
content:"\f230"
}
.fa-pinterest-p:before {
content:"\f231"
}
.fa-whatsapp:before {
content:"\f232"
}
.fa-server:before {
content:"\f233"
}
.fa-user-plus:before {
content:"\f234"
}
.fa-user-times:before {
content:"\f235"
}
.fa-hotel:before,
.fa-bed:before {
content:"\f236"
}
.fa-viacoin:before {
content:"\f237"
}
.fa-train:before {
content:"\f238"
}
.fa-subway:before {
content:"\f239"
}
.fa-medium:before {
content:"\f23a"
}
.fa-yc:before,
.fa-y-combinator:before {
content:"\f23b"
}
.fa-optin-monster:before {
content:"\f23c"
}
.fa-opencart:before {
content:"\f23d"
}
.fa-expeditedssl:before {
content:"\f23e"
}
.fa-battery-4:before,
.fa-battery-full:before {
content:"\f240"
}
.fa-battery-3:before,
.fa-battery-three-quarters:before {
content:"\f241"
}
.fa-battery-2:before,
.fa-battery-half:before {
content:"\f242"
}
.fa-battery-1:before,
.fa-battery-quarter:before {
content:"\f243"
}
.fa-battery-0:before,
.fa-battery-empty:before {
content:"\f244"
}
.fa-mouse-pointer:before {
content:"\f245"
}
.fa-i-cursor:before {
content:"\f246"
}
.fa-object-group:before {
content:"\f247"
}
.fa-object-ungroup:before {
content:"\f248"
}
.fa-sticky-note:before {
content:"\f249"
}
.fa-sticky-note-o:before {
content:"\f24a"
}
.fa-cc-jcb:before {
content:"\f24b"
}
.fa-cc-diners-club:before {
content:"\f24c"
}
.fa-clone:before {
content:"\f24d"
}
.fa-balance-scale:before {
content:"\f24e"
}
.fa-hourglass-o:before {
content:"\f250"
}
.fa-hourglass-1:before,
.fa-hourglass-start:before {
content:"\f251"
}
.fa-hourglass-2:before,
.fa-hourglass-half:before {
content:"\f252"
}
.fa-hourglass-3:before,
.fa-hourglass-end:before {
content:"\f253"
}
.fa-hourglass:before {
content:"\f254"
}
.fa-hand-grab-o:before,
.fa-hand-rock-o:before {
content:"\f255"
}
.fa-hand-stop-o:before,
.fa-hand-paper-o:before {
content:"\f256"
}
.fa-hand-scissors-o:before {
content:"\f257"
}
.fa-hand-lizard-o:before {
content:"\f258"
}
.fa-hand-spock-o:before {
content:"\f259"
}
.fa-hand-pointer-o:before {
content:"\f25a"
}
.fa-hand-peace-o:before {
content:"\f25b"
}
.fa-trademark:before {
content:"\f25c"
}
.fa-registered:before {
content:"\f25d"
}
.fa-creative-commons:before {
content:"\f25e"
}
.fa-gg:before {
content:"\f260"
}
.fa-gg-circle:before {
content:"\f261"
}
.fa-tripadvisor:before {
content:"\f262"
}
.fa-odnoklassniki:before {
content:"\f263"
}
.fa-odnoklassniki-square:before {
content:"\f264"
}
.fa-get-pocket:before {
content:"\f265"
}
.fa-wikipedia-w:before {
content:"\f266"
}
.fa-safari:before {
content:"\f267"
}
.fa-chrome:before {
content:"\f268"
}
.fa-firefox:before {
content:"\f269"
}
.fa-opera:before {
content:"\f26a"
}
.fa-internet-explorer:before {
content:"\f26b"
}
.fa-tv:before,
.fa-television:before {
content:"\f26c"
}
.fa-contao:before {
content:"\f26d"
}
.fa-500px:before {
content:"\f26e"
}
.fa-amazon:before {
content:"\f270"
}
.fa-calendar-plus-o:before {
content:"\f271"
}
.fa-calendar-minus-o:before {
content:"\f272"
}
.fa-calendar-times-o:before {
content:"\f273"
}
.fa-calendar-check-o:before {
content:"\f274"
}
.fa-industry:before {
content:"\f275"
}
.fa-map-pin:before {
content:"\f276"
}
.fa-map-signs:before {
content:"\f277"
}
.fa-map-o:before {
content:"\f278"
}
.fa-map:before {
content:"\f279"
}
.fa-commenting:before {
content:"\f27a"
}
.fa-commenting-o:before {
content:"\f27b"
}
.fa-houzz:before {
content:"\f27c"
}
.fa-vimeo:before {
content:"\f27d"
}
.fa-black-tie:before {
content:"\f27e"
}
.fa-fonticons:before {
content:"\f280"
}
.aloha-surface .aloha-ui-toolbar,
.aloha-editable .type-container .type-dropdown .type {
display:none
}
.aloha-editable .note>.type-container .type-dropdown+ul.dropdown-menu {
text-transform:uppercase
}
.aloha-editable .note.aloha-oer-block.aloha-ephemera-attr::before {
text-transform:capitalize
}
.aloha-editable .example>.title {
margin-left:1em
}
.not-converted-yet {
background-color:#fcc;
border:.2rem dotted red
}
html {
max-width:1260px;
margin:0 auto
}
body {
overflow:visible!important
}
h1,
h2,
h3,
h4,
h5,
h6 {
margin:0;
color:#21366b
}
h1,
.extra-large-header {
font-size:3.5rem;
font-weight:400
}
h2,
.large-header {
font-size:2.8rem;
font-weight:300
}
h3,
.medium-header {
font-size:2.1rem;
font-weight:400
}
h4,
.small-header {
font-size:1.6rem;
font-weight:400
}
h5,
.extra-small-header {
font-size:1.4rem;
font-weight:700
}
[draggable="true"] {
cursor:move
}
.dl-horizontal dt {
float:left;
width:160px;
clear:left;
text-align:right;
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap
}
.dl-horizontal dd {
margin-left:180px
}
.mail {
font-size:0;
line-height:2.4rem;
background-image:url("/images/social/mail.png");
background-repeat:no-repeat;
background-position:center center;
background-size:67%
}
.primary {
background-color:#21366b
}
.secondary {
background-color:#78b04a
}
.highlight {
background-color:#f3cf36
}
.q-match {
background-color:#ff0
}
.btn {
padding:.5rem 1rem;
font-weight:300;
vertical-align:baseline;
color:#fff;
background-color:#78b04a;
border:.1rem solid transparent;
outline:0
}
.btn:hover,
.btn:focus,
.btn:active,
.btn.active {
color:#fff;
background-color:#6ea244;
outline:0
}
.btn.disabled,
.btn[disabled],
fieldset[disabled] .btn,
.btn.disabled:hover,
.btn[disabled]:hover,
fieldset[disabled] .btn:hover,
.btn.disabled:focus,
.btn[disabled]:focus,
fieldset[disabled] .btn:focus,
.btn.disabled:active,
.btn[disabled]:active,
fieldset[disabled] .btn:active,
.btn.disabled.active,
.btn[disabled].active,
fieldset[disabled] .btn.active {
background-color:#78b04a
}
.btn:focus {
outline:0!important
}
.btn-plain {
padding:.5rem 1rem;
font-weight:300;
vertical-align:baseline;
color:#333;
background-color:#fff;
border:.1rem solid #333
}
.btn-plain:hover,
.btn-plain:focus,
.btn-plain:active,
.btn-plain.active {
color:#333;
background-color:#f5f5f5;
outline:0
}
.btn-plain.disabled,
.btn-plain[disabled],
fieldset[disabled] .btn-plain,
.btn-plain.disabled:hover,
.btn-plain[disabled]:hover,
fieldset[disabled] .btn-plain:hover,
.btn-plain.disabled:focus,
.btn-plain[disabled]:focus,
fieldset[disabled] .btn-plain:focus,
.btn-plain.disabled:active,
.btn-plain[disabled]:active,
fieldset[disabled] .btn-plain:active,
.btn-plain.disabled.active,
.btn-plain[disabled].active,
fieldset[disabled] .btn-plain.active {
background-color:#fff
}
.btn-warning,
.btn-primary.btn-warning,
.btn-plain.btn-warning {
padding:.5rem 1rem;
font-weight:300;
vertical-align:baseline;
color:#333;
background-color:#fff;
border:.1rem solid #f0ad4e
}
.btn-warning:hover,
.btn-primary.btn-warning:hover,
.btn-plain.btn-warning:hover,
.btn-warning:focus,
.btn-primary.btn-warning:focus,
.btn-plain.btn-warning:focus,
.btn-warning:active,
.btn-primary.btn-warning:active,
.btn-plain.btn-warning:active,
.btn-warning.active,
.btn-primary.btn-warning.active,
.btn-plain.btn-warning.active {
color:#333;
background-color:#f5f5f5;
outline:0
}
.btn-warning.disabled,
.btn-primary.btn-warning.disabled,
.btn-plain.btn-warning.disabled,
.btn-warning[disabled],
.btn-primary.btn-warning[disabled],
.btn-plain.btn-warning[disabled],
fieldset[disabled] .btn-warning,
fieldset[disabled] .btn-primary.btn-warning,
fieldset[disabled] .btn-plain.btn-warning,
.btn-warning.disabled:hover,
.btn-primary.btn-warning.disabled:hover,
.btn-plain.btn-warning.disabled:hover,
.btn-warning[disabled]:hover,
.btn-primary.btn-warning[disabled]:hover,
.btn-plain.btn-warning[disabled]:hover,
fieldset[disabled] .btn-warning:hover,
fieldset[disabled] .btn-primary.btn-warning:hover,
fieldset[disabled] .btn-plain.btn-warning:hover,
.btn-warning.disabled:focus,
.btn-primary.btn-warning.disabled:focus,
.btn-plain.btn-warning.disabled:focus,
.btn-warning[disabled]:focus,
.btn-primary.btn-warning[disabled]:focus,
.btn-plain.btn-warning[disabled]:focus,
fieldset[disabled] .btn-warning:focus,
fieldset[disabled] .btn-primary.btn-warning:focus,
fieldset[disabled] .btn-plain.btn-warning:focus,
.btn-warning.disabled:active,
.btn-primary.btn-warning.disabled:active,
.btn-plain.btn-warning.disabled:active,
.btn-warning[disabled]:active,
.btn-primary.btn-warning[disabled]:active,
.btn-plain.btn-warning[disabled]:active,
fieldset[disabled] .btn-warning:active,
fieldset[disabled] .btn-primary.btn-warning:active,
fieldset[disabled] .btn-plain.btn-warning:active,
.btn-warning.disabled.active,
.btn-primary.btn-warning.disabled.active,
.btn-plain.btn-warning.disabled.active,
.btn-warning[disabled].active,
.btn-primary.btn-warning[disabled].active,
.btn-plain.btn-warning[disabled].active,
fieldset[disabled] .btn-warning.active,
fieldset[disabled] .btn-primary.btn-warning.active,
fieldset[disabled] .btn-plain.btn-warning.active {
background-color:#fff
}
.btn-danger,
.btn-primary.btn-danger,
.btn-plain.btn-danger {
padding:.5rem 1rem;
font-weight:300;
vertical-align:baseline;
color:#333;
background-color:#fff;
border:.1rem solid #d9534f
}
.btn-danger:hover,
.btn-primary.btn-danger:hover,
.btn-plain.btn-danger:hover,
.btn-danger:focus,
.btn-primary.btn-danger:focus,
.btn-plain.btn-danger:focus,
.btn-danger:active,
.btn-primary.btn-danger:active,
.btn-plain.btn-danger:active,
.btn-danger.active,
.btn-primary.btn-danger.active,
.btn-plain.btn-danger.active {
color:#333;
background-color:#f5f5f5;
outline:0
}
.btn-danger.disabled,
.btn-primary.btn-danger.disabled,
.btn-plain.btn-danger.disabled,
.btn-danger[disabled],
.btn-primary.btn-danger[disabled],
.btn-plain.btn-danger[disabled],
fieldset[disabled] .btn-danger,
fieldset[disabled] .btn-primary.btn-danger,
fieldset[disabled] .btn-plain.btn-danger,
.btn-danger.disabled:hover,
.btn-primary.btn-danger.disabled:hover,
.btn-plain.btn-danger.disabled:hover,
.btn-danger[disabled]:hover,
.btn-primary.btn-danger[disabled]:hover,
.btn-plain.btn-danger[disabled]:hover,
fieldset[disabled] .btn-danger:hover,
fieldset[disabled] .btn-primary.btn-danger:hover,
fieldset[disabled] .btn-plain.btn-danger:hover,
.btn-danger.disabled:focus,
.btn-primary.btn-danger.disabled:focus,
.btn-plain.btn-danger.disabled:focus,
.btn-danger[disabled]:focus,
.btn-primary.btn-danger[disabled]:focus,
.btn-plain.btn-danger[disabled]:focus,
fieldset[disabled] .btn-danger:focus,
fieldset[disabled] .btn-primary.btn-danger:focus,
fieldset[disabled] .btn-plain.btn-danger:focus,
.btn-danger.disabled:active,
.btn-primary.btn-danger.disabled:active,
.btn-plain.btn-danger.disabled:active,
.btn-danger[disabled]:active,
.btn-primary.btn-danger[disabled]:active,
.btn-plain.btn-danger[disabled]:active,
fieldset[disabled] .btn-danger:active,
fieldset[disabled] .btn-primary.btn-danger:active,
fieldset[disabled] .btn-plain.btn-danger:active,
.btn-danger.disabled.active,
.btn-primary.btn-danger.disabled.active,
.btn-plain.btn-danger.disabled.active,
.btn-danger[disabled].active,
.btn-primary.btn-danger[disabled].active,
.btn-plain.btn-danger[disabled].active,
fieldset[disabled] .btn-danger.active,
fieldset[disabled] .btn-primary.btn-danger.active,
fieldset[disabled] .btn-plain.btn-danger.active {
background-color:#fff
}
.btn-primary {
padding:.5rem 1rem;
font-weight:300;
vertical-align:baseline;
color:#fff;
background-color:#21366b;
border:.1rem solid transparent
}
.btn-primary:hover,
.btn-primary:focus,
.btn-primary:active,
.btn-primary.active {
color:#fff;
background-color:#1c2e5b;
outline:0
}
.btn-primary.disabled,
.btn-primary[disabled],
fieldset[disabled] .btn-primary,
.btn-primary.disabled:hover,
.btn-primary[disabled]:hover,
fieldset[disabled] .btn-primary:hover,
.btn-primary.disabled:focus,
.btn-primary[disabled]:focus,
fieldset[disabled] .btn-primary:focus,
.btn-primary.disabled:active,
.btn-primary[disabled]:active,
fieldset[disabled] .btn-primary:active,
.btn-primary.disabled.active,
.btn-primary[disabled].active,
fieldset[disabled] .btn-primary.active {
background-color:#21366b
}
.circle {
display:inline-block;
height:2.8rem;
width:2.8rem;
border-radius:50%;
overflow:hidden
}
.facebook {
background-image:url("/images/social/facebook.png");
background-size:.9rem 2rem!important
}
.facebook,
.twitter {
font-size:0;
line-height:2.4rem;
background-repeat:no-repeat;
background-position:center center;
background-size:67%
}
.twitter {
background-image:url("/images/social/twitter.png")
}
.google {
background-image:url("/images/social/google.png");
background-position:0 .5rem!important;
background-size:2.4rem 2.4rem!important
}
.google,
.linkedin {
font-size:0;
line-height:2.4rem;
background-repeat:no-repeat;
background-position:center center;
background-size:67%
}
.linkedin {
background-image:url("/images/social/linkedin.png");
background-size:60%!important;
background-position:50% 45%!important
}
.list-comma:not(:last-of-type)::after {
content:", "
}
iframe.simulation {
display:block;
border:0
}
@-moz-document url-prefix() {
select {
 -moz-appearance:none;
 background-image:url('/images/icons/select-arrows.png') !important;
 background-repeat:no-repeat!important;
 background-position:right 1rem center;
 background-size:1.2rem 1.8rem
}
}
.select2-drop-mask {
z-index:0!important
}
.select2-drop {
z-index:1!important
}
.select2-results>.select2-highlighted {
background-color:#21366b!important
}
.select2-container-multi>.select2-choices>.select2-search-choice {
margin-top:.6rem!important;
border-radius:.4rem!important
}
.modal-open {
padding-right:0!important
}
p:empty {
height:.1rem
}
.alert-warning {
background-color:#faeda9;
color:#836633
}
.alert-danger {
background-color:#f0c8c8;
color:#b33835
}
.alert-success {
background-color:#d9f3ce;
color:#2a702b
}
.caret {
border-top:4px solid!important
}
.page-header {
position:relative;
padding:0;
margin:0;
z-index:2;
background-color:rgba(255,255,255,.9);
border-bottom:2px solid #dcdcdc
}
.page-header>.login {
padding:1rem 1.5rem 0 0;
font-size:.9em;
font-weight:300;
text-align:right
}
.page-header>.login>ul {
margin-bottom:0
}
.page-header>.login>#skiptocontent,
.page-header>.login>#skiptoresults {
position:absolute
}
.page-header>.login>#skiptocontent a,
.page-header>.login>#skiptoresults a {
opacity:0
}
.page-header>.login>#skiptocontent a:focus,
.page-header>.login>#skiptoresults a:focus {
opacity:1;
left:0;
top:0;
padding:.5rem 1rem;
font-size:1.8rem;
color:#fff;
background:#78b04a;
outline:0;
border-bottom-right-radius:1rem;
-webkit-transition:top .1s ease-in,background .5s linear;
transition:top .1s ease-in,background .5s linear
}
.page-header>.login>ul {
padding:0;
list-style-type:none
}
.page-header>.login>ul>li {
display:inline-block
}
.page-header>.login>ul>li::after {
padding:0 .5rem 0 .8rem;
color:#dcdcdc;
content:"|"
}
.page-header>.login>ul>li:last-child::after {
padding:0;
content:""
}
.page-header>.login .btn {
padding:.3rem 1rem
}
.page-header>.navbar {
border-radius:0
}
.page-header>.navbar.navbar-default {
background-color:transparent;
border:none
}
.page-header>.navbar>.container-fluid {
padding:0
}
.page-header>.navbar>.container-fluid>.navbar-header {
margin-right:1.5rem;
padding-bottom:.7rem;
float:left;
clear:left
}
@media (max-width:767px) {
.page-header>.navbar>.container-fluid>.navbar-header {
 margin-left:0;
 width:100%
}
}
.page-header>.navbar>.container-fluid>.navbar-header .navbar-brand {
padding:0;
margin-top:.5rem;
margin-left:1.5rem;
width:20rem;
height:3.8rem;
background:center center no-repeat;
background-size:contain;
text-indent:-999rem;
white-space:nowrap;
overflow:hidden
}
.page-header>.navbar>.container-fluid>.navbar-collapse {
padding-right:0
}
.page-header>.navbar>.container-fluid>.navbar-collapse.in {
background-color:#fff
}
.page-header>.navbar>.container-fluid>.navbar-collapse .nav>li {
padding:0 1rem
}
.page-header>.navbar>.container-fluid>.navbar-collapse .nav>li:last-child {
padding-right:0
}
.page-header>.navbar>.container-fluid>.navbar-collapse .nav>li>a {
padding:0;
font-size:1.1em;
font-weight:500;
color:#21366b;
line-height:5.46666667rem;
white-space:nowrap
}
.page-header>.navbar>.container-fluid>.navbar-collapse .nav>li>a:hover {
color:#21366b;
text-decoration:underline;
background-color:transparent
}
.page-header>.navbar>.container-fluid>.navbar-collapse .nav>li.active>a {
color:#606163;
background-color:transparent
}
.page-header>.navbar>.container-fluid>.navbar-collapse .nav>li.active>a:hover {
background-color:transparent
}
.page-header .alert {
border-top-left-radius:0;
border-top-right-radius:0;
margin-bottom:0
}
body {
overflow-anchor:none
}
#header {
max-width:1260px;
background-color:#fff;
z-index:1
}
.clearfix:before,
.clearfix:after,
.page-footer:before,
.page-footer:after {
content:" ";
display:table
}
.clearfix:after,
.page-footer:after {
clear:both
}
.page-footer {
padding:2rem;
margin:0!important;
font-size:.85em;
text-align:center;
background-color:#333
}
.page-footer,
.page-footer a {
color:#dcdcdc
}
.page-footer>.copyright {
position:relative;
min-height:1px;
padding-left:15px;
padding-right:3rem;
text-align:left
}
@media (min-width:768px) {
.page-footer>.copyright {
 float:left;
 width:66.66666667%
}
}
.page-footer>.copyright>div {
padding:.8rem 0;
margin:0
}
.page-footer>.copyright .cc-logo-link {
float:left;
margin-right:1.5rem
}
.page-footer>.copyright .horizontal {
display:inline-block;
margin:0;
padding:0
}
.page-footer>.copyright .horizontal li {
display:inline-block;
padding-right:.7rem;
padding-left:.3rem;
border-right:.1rem solid #606163
}
.page-footer>.copyright .horizontal li:first-child {
padding-left:0
}
.page-footer>.copyright .horizontal li:last-child {
border-right:none
}
.page-footer>.copyright .oer {
background-color:#fff;
border-radius:.4rem
}
.page-footer>.connect,
.page-footer>.share {
position:relative;
min-height:1px;
padding-left:15px;
padding-right:15px
}
@media (min-width:768px) {
.page-footer>.connect,
.page-footer>.share {
 float:left;
 width:16.66666667%
}
}
@media (max-width:767px) {
.page-footer>.connect,
.page-footer>.share {
 display:none
}
}
.page-footer>.connect .small-header,
.page-footer>.share .small-header {
margin-top:1.5rem;
margin-bottom:.7rem;
font-size:1.7rem;
font-weight:400;
color:#dcdcdc
}
.page-footer>.connect>ul,
.page-footer>.share>ul {
padding:0;
list-style-type:none
}
.page-footer>.connect>ul>li {
margin-bottom:.2rem
}
@media (min-width:480px) {
.page-footer>.connect {
 border-left:.1rem solid #606163;
 border-right:.1rem solid #606163
}
}
.page-footer>.share>ul {
display:-webkit-box;
display:-moz-box;
display:-ms-box;
display:-o-box;
display:box;
display:-ms-flexbox;
display:-webkit-flex;
display:-moz-flex;
display:-ms-flex;
display:-o-flex;
display:flex;
-webkit-flex-flow:row wrap;
-ms-flex-flow:row wrap;
flex-flow:row wrap;
-webkit-box-pack:center;
-moz-box-pack:center;
-ms-flex-pack:center;
-webkit-justify-content:center;
-moz-justify-content:center;
-ms-justify-content:center;
-o-justify-content:center;
justify-content:center;
max-width:7.5rem;
margin:0 auto
}
.page-footer>.share>ul>li {
-webkit-flex:1 0 auto;
-moz-flex:1 0 auto;
-ms-flex:1 0 auto;
-o-flex:1 0 auto;
flex:1 0 auto;
margin:.5rem 0
}
#error .message {
margin:4rem 0;
text-align:center
}
#error .message>h1 {
font-size:15rem
}
#error .message>.reason {
font-size:4rem
}
#error .message>p {
font-size:1.67rem
}
.splash {
margin-top:-11.1rem
}
.splash>.banner {
position:relative;
width:100%;
height:48rem;
background:url(/images/banners/splash.jpg) no-repeat center right;
-webkit-background-size:cover;
-moz-background-size:cover;
-o-background-size:cover;
background-size:cover
}
@media screen and (max-width:767px) {
.splash>.banner {
 background-position:center right -5rem
}
}
.splash>.banner>.text-overlay {
position:absolute;
top:14rem;
right:50%;
bottom:0;
left:0;
color:#333
}
.splash>.banner>.text-overlay>h1,
.splash>.banner>.text-overlay>a {
margin-left:5rem
}
.splash>.banner>.text-overlay>h1 {
margin-top:5rem;
margin-bottom:3rem;
font-weight:300;
color:#21366b
}
.splash>.banner>.text-overlay>p {
margin:0 0 2.5rem 5rem;
font-size:1.6rem;
font-weight:300
}
@media (max-width:767px) {
.splash>.banner>.text-overlay>p {
 display:none
}
}
.splash>.banner>.text-overlay>a {
font-size:1.6rem
}
@media (max-width:767px) {
.splash>.banner>.text-overlay {
 position:absolute;
 top:0;
 right:auto;
 display:flex;
 align-items:center;
 width:100%;
 height:100%;
 background-color:rgba(255,255,255,.2)
}
.splash>.banner>.text-overlay>h1 {
 max-width:80%;
 margin:0;
 padding-left:3rem;
 padding-right:6rem;
 text-shadow:0 0 .2em rgba(255,255,255,.8)
}
}
.clearfix:before,
.clearfix:after,
.featured-books:before,
.featured-books:after {
content:" ";
display:table
}
.clearfix:after,
.featured-books:after {
clear:both
}
.featured-books {
padding:3rem;
margin:0!important;
overflow:hidden
}
.featured-books p {
font-weight:300;
color:#333
}
.featured-books>h2 {
padding-bottom:2rem
}
.featured-books>.books {
position:relative;
margin-top:20px;
width:100%;
overflow:hidden
}
.featured-books>.books>.book {
position:relative;
padding-left:15px;
padding-right:15px;
display:block;
min-height:182px;
margin-bottom:3rem;
padding-bottom:2rem
}
@media (min-width:768px) {
.featured-books>.books>.book {
 float:left;
 width:50%
}
}
.featured-books>.books>.book::after {
display:block;
height:0;
clear:both;
font-size:0;
content:" ";
visibility:hidden
}
.featured-books>.books>.book:nth-child(2n+1) {
clear:left;
padding-right:1.5rem;
padding-left:0
}
.featured-books>.books>.book:nth-child(2n) {
padding-left:1.5rem
}
@media screen and (max-width:767px) {
.featured-books>.books>.book {
 padding-left:0!important
}
}
.featured-books>.books>.book img {
float:left;
margin-right:2rem;
border:0
}
.featured-books>.books>.book h3 {
margin-bottom:1rem
}
.featured-books>.books>.book h3 a {
font-weight:300;
color:#21366b
}
.featured-books>.books>.book p.description {
overflow:hidden;
max-height:60px;
text-align:justify
}
.featured-books>.books>.book p.description.extended {
max-height:100%
}
.featured-books>.books>.book p.description:not(.extended).show-ellipsis {
position:relative
}
.featured-books>.books>.book p.description:not(.extended).show-ellipsis:after {
content:'…';
position:absolute;
bottom:0;
right:0;
padding-left:5%;
background:-webkit-gradient(linear,left top,right top,from(rgba(255,255,255,0)),to(#fff),color-stop(50%,#fff));
background:-moz-linear-gradient(to right,rgba(255,255,255,0),#fff 50%,#fff);
background:-o-linear-gradient(to right,rgba(255,255,255,0),#fff 50%,#fff);
background:-ms-linear-gradient(to right,rgba(255,255,255,0),#fff 50%,#fff);
background:linear-gradient(to right,rgba(255,255,255,0),#fff 50%,#fff)
}
.featured-books>.books>.book .show-more-less {
float:right
}
.featured-books>.books>.book .show-more-less>.more::after {
content:'▸';
margin-left:.5rem
}
.featured-books>.books>.book .show-more-less>.less {
display:none
}
.featured-books>.books>.book .show-more-less>.less::after {
content:'▴';
margin-left:.5rem
}
#section-name-modal label {
display:block;
margin:0 auto;
width:100%
}
#section-name-modal label>span {
margin-right:1.5rem
}
#section-name-modal label>input {
display:inline-block;
width:65%
}
.clearfix:before,
.clearfix:after {
display:table
}
.table-of-contents>.toc ul {
padding:0 0 .5rem 1.5rem;
font-size:1.25rem;
list-style-type:none
}
.table-of-contents>.toc ul li {
border-bottom:.1rem solid #ededed
}
.table-of-contents>.toc ul li.chapter-number {
font-weight:700;
color:#21366b
}
.table-of-contents>.toc ul li.chapter-number::after {
content:"."
}
.table-of-contents>.toc ul li:last-child {
border-bottom:none
}
.table-of-contents>.toc ul li>div {
display:inline-block;
width:100%;
border-top:.3rem solid transparent;
border-bottom:.3rem solid transparent
}
.table-of-contents>.toc ul li>div.before {
border-top:.3rem solid #6c9e42
}
.table-of-contents>.toc ul li>div.after {
border-bottom:.3rem solid #6c9e42
}
.table-of-contents>.toc ul li>div.insert {
background-color:rgba(110,162,68,.5)
}
.table-of-contents>.toc ul li>div>.section-wrapper {
background:0 0;
box-shadow:none;
border:none;
text-align:left
}
.table-of-contents>.toc ul li>div>.section-wrapper:focus {
outline:1px;
outline-style:dotted
}
.table-of-contents>.toc ul li>div>.name-wrapper {
display:inline-block;
vertical-align:middle;
cursor:pointer
}
.table-of-contents>.toc ul li>div>.name-wrapper .os-number {
font-weight:700
}
.table-of-contents>.toc ul li>div>.name-wrapper small {
margin-left:1rem;
color:red
}
.table-of-contents>.toc ul li>div>.name-wrapper .active {
font-weight:700;
color:#78b04a
}
.table-of-contents>.toc ul li>div>.name-wrapper>a:hover {
color:#78b04a;
text-decoration:none
}
.table-of-contents>.toc ul li>div>.name-wrapper>a>.snippet {
color:#000;
padding-bottom:1.25rem
}
.table-of-contents>.toc ul li>div>.name-wrapper>a>.snippet>.match-count {
font-weight:300;
text-align:right;
margin-top:.5rem;
margin-bottom:.5rem;
color:gray
}
.table-of-contents>.toc ul li>div>.name-wrapper>a>.snippet .q-match {
font-weight:700;
background-color:inherit
}
.table-of-contents>.toc ul li>div>.name-wrapper.section-wrapper:hover {
text-decoration:underline
}
.table-of-contents>.toc ul li>div[data-expandable="true"]>.name-wrapper {
width:80%
}
.table-of-contents>.toc ul li>div[data-expandable="true"]>.name-wrapper::before {
font-size:135%;
content:"\25b8";
cursor:pointer
}
.table-of-contents>.toc ul li>div[data-expandable="true"]>.edit {
width:8%;
text-align:right;
vertical-align:middle;
opacity:0;
cursor:pointer
}
.table-of-contents>.toc ul li>div[data-expanded="true"]>.name-wrapper::before {
content:"\25be"
}
.table-of-contents>.toc ul li>div>.remove {
display:inline-block;
width:10%;
color:red;
vertical-align:middle;
text-align:right;
opacity:0;
cursor:pointer
}
.table-of-contents>.toc ul li>div:hover>.remove,
.table-of-contents>.toc ul li>div:hover>.edit {
opacity:1
}
.table-of-contents>.toc ul li.active-container>div[data-expandable="true"]:not([data-expanded="true"]) {
font-weight:700
}
.table-of-contents>.toc ul li>ul {
display:none;
font-size:.95em
}
.table-of-contents>.toc ul li>ul[data-expanded="true"] {
display:block
}
.popover {
border:none;
border-radius:0;
box-shadow:0 0 1.2rem rgba(0,0,0,.25);
cursor:auto
}
.popover .popover-content {
padding:.3rem 0;
color:#333
}
.popover .popover-content ul.menu {
margin-bottom:0;
padding-left:0;
list-style-type:none
}
.popover .popover-content ul.menu>li.menuitem {
padding:.3rem 2rem;
font-weight:400
}
.popover .popover-content ul.menu>li.menuitem:hover,
.popover .popover-content ul.menu>li.menuitem:focus {
text-decoration:none;
color:#262626;
background-color:#f5f5f5;
cursor:pointer
}
.popover.top>.arrow {
bottom:-.7rem;
left:100%;
border:none
}
.popover.top>.arrow::after {
border-width:.6rem;
border-bottom-width:0
}
.popover.right>.arrow {
left:-.7rem;
top:2.1rem;
border:none
}
.popover.right>.arrow::after {
border-width:.6rem;
border-left-width:0
}
.popover.bottom>.arrow {
top:-.7rem;
left:100%;
border:none
}
.popover.bottom>.arrow::after {
border-width:.6rem;
border-top-width:0
}
.popover.left {
margin:0 1rem 0 0
}
.popover.left>.arrow {
right:-.7rem;
top:2.1rem;
border:none
}
.popover.left>.arrow::after {
border-width:.6rem;
border-right-width:0
}
.add-page-search-results td,
.add-page-search-results h4 {
color:#000
}
.add-page-search-results .add {
width:6rem;
text-align:center
}
.add-page-search-results .authors {
width:16.5rem
}
.add-page-search-results .authors .author {
display:block
}
.add-page-search-results .edited {
width:11.5rem
}
.add-page-search-results table {
table-layout:fixed;
overflow:hidden
}
.add-page-search-results table tbody {
word-wrap:break-word
}
#add-page-modal .modal-dialog {
width:80rem
}
#add-page-modal .modal-dialog .modal-body {
max-height:40rem;
overflow-y:scroll
}
#add-page-modal label {
display:block;
margin:0 auto;
width:90%
}
#add-page-modal label>span {
margin-right:1.5rem
}
#add-page-modal label>input[type="text"] {
display:inline-block;
width:83%
}
#add-page-modal label>.help-block {
width:83%;
text-align:left;
margin-left:5.4rem
}
#add-page-modal .modal-footer .help-block {
display:inline-block;
margin-right:1.5rem
}
.clearfix:before,
.clearfix:after {
display:table
}
.table-of-contents>div {
margin-bottom:1rem;
padding:1rem
}
.table-of-contents.pinned {
padding-left:.5rem;
padding-right:1.5rem
}
.table-of-contents .clear-results {
padding-top:.75rem
}
.table-of-contents .result-count {
text-align:right;
color:gray;
font-weight:300;
padding-bottom:5px;
border-bottom:solid 1px #ededed
}
.table-of-contents>.add {
margin:.5rem 0 .5rem 2rem
}
.table-of-contents>.dropdown-menu {
margin-left:2rem
}
.table-of-contents>.toc {
color:#21366b
}
.table-of-contents.static span:focus {
outline:none
}
.endorsed,
.latest {
padding:.5rem 3rem;
background-color:#f3cf36
}
.latest a {
text-decoration:underline
}
.clearfix:before,
.clearfix:after {
display:table
}
.media-title {
padding:1rem 3rem
}
.media-title.compact {
padding:1rem 1rem 0 1.3rem;
font-size:85%
}
.media-title.compact .large-header {
font-size:1.8rem
}
.media-title.compact .info>.share {
display:none
}
.media-title:not(.publishing) {
background-color:#ededed
}
@media (max-width:576px) {
.media-title {
 padding:1rem 1.5rem .5rem
}
.media-title.compact {
 padding-bottom:.5rem
}
}
.media-title a:focus {
background-color:#78b04a
}
.media-title.publishing {
opacity:.7;
border-left:2em solid #5bc0de
}
.media-title>.derive,
.media-title .edit {
margin-bottom:1.5rem
}
.media-title>.title {
overflow-wrap:break-word
}
@media (min-width:576px) {
.media-title>.title {
 display:inline-block;
 margin-right:7%;
 width:calc(100% - 29rem)
}
.media-title>.title>h1 {
 font-weight:400
}
}
.media-title>.title>span {
display:block;
margin-top:.5rem
}
.media-title>.title input[type="text"] {
width:60rem;
height:4.5rem;
text-overflow:ellipsis
}
.media-title>.info {
overflow-wrap:break-word;
-webkit-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none
}
@media (min-width:576px) {
.media-title>.info {
 display:inline-block;
 margin-bottom:-3.9rem;
 width:20rem;
 text-align:right;
 vertical-align:top
}
}
@media (max-width:576px) {
.media-title>.info {
 margin-top:.5rem
}
}
.media-title>.info>.share {
margin-top:.5rem;
margin-bottom:1.5rem
}
@media (max-width:767px) {
.media-title>.info>.share {
 display:none
}
}
.media-title>.info>.share>ul {
display:inline-block;
padding:0;
list-style-type:none
}
.media-title>.info>.share>ul>li {
display:inline-block;
height:2.8rem;
vertical-align:middle;
cursor:pointer
}
.clearfix:before,
.clearfix:after {
display:table
}
.footer-nav .media-nav>.media-toolbar>.media-navbar {
width:100%
}
.media-nav {
padding:1rem
}
.media-nav:not(.publishing) {
background-color:#ededed
}
@media (max-width:576px) {
.media-nav {
 padding:0 1rem
}
}
.media-nav>.media-toolbar>div,
.media-nav>.media-toolbar>span {
display:inline-block;
vertical-align:bottom
}
.media-nav>.media-toolbar .toggle.btn {
background-color:#21366b;
color:#fff;
border:solid 2px #21366b;
width:13rem;
margin:3px
}
.media-nav>.media-toolbar .toggle.btn .text {
margin:0 6px
}
.media-nav>.media-toolbar .toggle.btn.open {
background-color:#fff;
color:#21366b
}
.media-nav>.media-toolbar .toggle.btn:focus {
box-shadow:0 0 3px 2px lightblue
}
.media-nav>.media-toolbar .searchbar {
width:calc(35% - 6.5rem);
position:relative;
margin:3px
}
@media (max-width:576px) {
.media-nav>.media-toolbar .searchbar {
 width:calc(100% - 13rem - 3rem)
}
}
.media-nav>.media-toolbar .searchbar .fa {
position:absolute;
left:calc(100% - 27px);
top:.3em;
color:#cdcdcd;
font-size:150%
}
.media-nav>.media-toolbar .searchbar .fa.clear-search,
.media-nav>.media-toolbar .searchbar .fa.fa-search {
cursor:pointer
}
.media-nav>.media-toolbar .media-navbar {
width:calc(65% - 9.1rem)
}
@media (max-width:576px) {
.media-nav>.media-toolbar .media-navbar {
 width:100%;
 display:block
}
}
.media-nav>.media-toolbar .media-navbar>.book-nav {
display:-webkit-box;
display:-moz-box;
display:-ms-box;
display:-o-box;
display:box;
display:-ms-flexbox;
display:-webkit-flex;
display:-moz-flex;
display:-ms-flex;
display:-o-flex;
display:flex;
-webkit-flex-flow:row nowrap;
-ms-flex-flow:row nowrap;
flex-flow:row nowrap;
-webkit-box-pack:center;
-moz-box-pack:center;
-ms-flex-pack:center;
-webkit-justify-content:center;
-moz-justify-content:center;
-ms-justify-content:center;
-o-justify-content:center;
justify-content:center;
-webkit-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.progress,
.media-nav>.media-toolbar .media-navbar>.book-nav>.back-to-top {
-webkit-flex:1 1 75%;
-moz-flex:1 1 75%;
-ms-flex:1 1 75%;
-o-flex:1 1 75%;
flex:1 1 75%
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.progress {
margin-top:1.4rem;
margin-bottom:0;
height:.9rem;
border-radius:.8rem;
background-color:#cfcfcf;
box-shadow:none
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.progress>.progress-bar {
-webkit-box-sizing:content-box;
-moz-box-sizing:content-box;
box-sizing:content-box;
border-right:.1rem solid #fff;
box-shadow:none
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.back-to-top {
text-align:center;
line-height:4.9rem
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.back-to-top>a {
display:inline-block;
padding:0 .5rem
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.back-to-top::before,
.media-nav>.media-toolbar .media-navbar>.book-nav>.back-to-top::after {
font-size:1.4em;
color:#21366b;
content:"\25b4"
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.nav {
font-size:1.6rem;
line-height:3.8rem;
color:#21366b;
display:flex
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.nav.disabled {
opacity:.5
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.back {
padding-right:1rem;
text-align:right
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.back:before {
-ms-transform:scaleX(-1);
-webkit-transform:scaleX(-1);
transform:scaleX(-1)
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.next {
padding-left:2rem;
text-align:left
}
.media-nav>.media-toolbar .media-navbar>.book-nav>.back::before,
.media-nav>.media-toolbar .media-navbar>.book-nav>.next::after {
display:inline-block;
margin:1rem 1rem 0;
height:1.6rem;
width:1.6rem;
vertical-align:text-bottom;
border-radius:50%;
color:#fff;
background:#21366b url(/images/icons/arrow-white.png) no-repeat .6rem center;
background-size:40%;
content:""
}
.media-nav .toc-panel {
width:100%;
background-color:#fff;
border:solid 2px #ededed;
display:none
}
.book-popover {
max-width:20rem;
padding:.6rem 1.4rem
}
.book-popover .header h2,
.book-popover .header img {
display:inline-block;
vertical-align:middle
}
.book-popover .header h2 {
margin-left:.5rem
}
.book-popover .header p {
margin:1rem 0;
color:#555
}
.book-popover h3 {
color:#555
}
.book-popover ul {
padding:0;
list-style-type:none
}
.book-popover ul li {
display:inline-block;
padding:1rem 0
}
.book-popover ul li::after {
padding:0 .5rem 0 .8rem;
color:#dcdcdc;
content:"|"
}
.book-popover ul li:last-child::after {
padding:0;
content:""
}
.book-popover .download-book ul {
border-bottom:.1rem solid #ededed
}
.book-popover .btn {
margin-bottom:.5rem;
width:100%
}
.clearfix:before,
.clearfix:after {
display:table
}
[data-is-baked="true"] details {
display:none
}
.media-header {
padding:0 6rem 2rem;
border-bottom:.1rem solid #dcdcdc
}
.media-header.publishing {
opacity:.7;
border-left:2em solid #5bc0de
}
.media-header>.derive,
.media-header .edit {
margin-top:3.5rem
}
.media-header>.title {
margin-top:2rem;
overflow-wrap:break-word;
text-align:center
}
@media (min-width:768px) {
.media-header>.title {
 display:inline-block;
 margin-right:7%;
 text-align:left;
 width:calc(100% - 29rem)
}
}
.media-header>.title .title-chapter {
font-weight:400;
color:#21366b;
padding-right:.4em
}
.media-header>.title .os-number {
font-weight:500
}
.media-header>.title input[type="text"] {
width:55rem;
text-overflow:ellipsis
}
.media-header>.title>span {
display:block;
margin-top:.5rem
}
.media-header>.info {
overflow-wrap:break-word;
text-align:center
}
@media (min-width:768px) {
.media-header>.info {
 display:inline-block;
 margin-top:3.5rem;
 width:20rem;
 text-align:right;
 vertical-align:top
}
}
@media (max-width:767px) {
.media-header>.info {
 margin-top:.5rem
}
}
.media-header>.info>span,
.media-header>.info>span>a {
vertical-align:middle
}
.media-header>.info>.downloads>.btn,
.media-header>.info>.jump-to-cc>.btn {
margin:0 0 2rem auto
}
.media-header>.info>.downloads>.invert-on-focus:focus,
.media-header>.info>.jump-to-cc>.invert-on-focus:focus {
background-color:#fff;
border-color:#78b04a;
color:#78b04a
}
@media (max-width:767px) {
.media-header>.info>.downloads>.btn,
.media-header>.info>.jump-to-cc>.btn {
 margin:2rem auto
}
}
@media (max-width:767px) {
.media-header>.info>.downloads {
 display:none
}
}
.media-header>.info>.jump-to-cc>.btn {
background-color:#f2774a
}
.media-header>details {
margin-top:1.5rem
}
.media-header>details summary {
-webkit-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none;
cursor:pointer
}
@media (min-width:768px) {
.media-header>details>.abstract {
 max-width:67%
}
}
.media-header>details>.abstract>ul,
.media-header>details>.abstract>list {
display:block;
padding-left:4rem;
margin-top:1rem
}
.media-header>details>.abstract>ul>li,
.media-header>details>.abstract>list>li,
.media-header>details>.abstract>ul>item,
.media-header>details>.abstract>list>item {
display:list-item;
margin:.3rem 0;
color:#555
}
.fullsize-container>.sidebar {
width:0;
height:0;
display:inline-block;
vertical-align:top;
visibility:hidden;
-webkit-transition:width .2s ease-in-out;
-o-transition:width .2s ease-in-out;
transition:width .2s ease-in-out
}
.fullsize-container>.sidebar>div {
overflow-y:hidden;
-webkit-transition:margin-left .2s ease-in-out;
-o-transition:margin-left .2s ease-in-out;
transition:margin-left .2s ease-in-out;
margin-left:-315px
}
.fullsize-container>.main {
-webkit-transition:width .2s ease-in-out;
-o-transition:width .2s ease-in-out;
transition:width .2s ease-in-out;
width:calc(100% - 7px);
display:inline-block
}
@media (max-width:640px) {
.fullsize-container>.main {
 display:block
}
}
.fullsize-container.sidebar-open>.sidebar {
width:315px;
height:100%;
visibility:visible;
position:sticky
}
@media (max-width:640px) {
.fullsize-container.sidebar-open>.sidebar {
 width:100%
}
.fullsize-container.sidebar-open>.sidebar .table-of-contents.pinned {
 max-width:100%
}
}
.fullsize-container.sidebar-open>.sidebar>div {
overflow-y:auto;
margin-left:0;
border-right:1px solid #cdcdcd
}
.fullsize-container.sidebar-open>.main {
width:calc(100% - 322px)
}
@media (max-width:640px) {
.fullsize-container.sidebar-open>.main {
 display:none
}
}
#processing-instructions-modal .modal-dialog {
width:80rem
}
#processing-instructions-modal .modal-dialog .modal-body {
max-height:50rem;
overflow-y:scroll
}
#processing-instructions-modal .modal-dialog .modal-body textarea {
width:100%
}
#sims-modal .modal-dialog {
width:96.2rem
}
#sims-modal .modal-body {
padding:0
}
#sims-modal .sim-iframe {
width:96rem;
height:76.2rem
}
.clearfix:before,
.clearfix:after {
display:table
}
*[data-label]:not([data-label=""]):not(.ui-has-child-title):not(.btn-link)::before {
content:attr(data-label)': '
}
.media-body {
max-width:960px;
margin:0 auto;
display:block;
padding:4rem 6rem 0;
width:auto;
min-height:6rem;
counter-reset:figure;
outline:none
}
.media-body.draft:not(.publishing) {
padding:4rem 6rem;
background-color:#ffc;
min-height:4in
}
.media-body.publishing {
opacity:.7;
border-left:2em solid #5bc0de
}
.media-body cnx-pi {
display:none
}
@media (max-width:960px) {
.media-body {
 padding-right:2rem;
 padding-left:2rem
}
}
.media-body>.spacer {
height:100vh
}
.media-body-about {
max-width:960px;
margin:0 auto;
display:block;
padding:4rem 6rem 0;
width:auto
}
.media-body-about .media-body-about-description-wrapper {
display:flex;
flex-direction:row;
margin:2rem 0
}
.media-body-about .media-body-about-description-wrapper .media-body-about-cover {
width:calc(125px + 2rem);
height:calc(125px + 2rem);
margin-right:2rem
}
.media-body-about .media-body-about-description-wrapper .media-body-about-description {
flex:1
}
body {
-webkit-transition:background .5s ease-in-out;
-o-transition:background .5s ease-in-out;
transition:background .5s ease-in-out
}
@media (max-width:767px) {
.media-body-about .media-body-about-description-wrapper {
 display:block
}
.media-body-about .media-body-about-description-wrapper .media-body-about-cover {
 margin-bottom:2rem
}
}
/* [data-is-baked="true"] .media-body>#content */ h1,
/* [data-is-baked="true"] .media-body>#content */ h2,
/* [data-is-baked="true"] .media-body>#content */ h3,
/* [data-is-baked="true"] .media-body>#content */ h4,
/* [data-is-baked="true"] .media-body>#content */ h5,
/* [data-is-baked="true"] .media-body>#content */ h6 {
color:#333
}
/* [data-is-baked="true"] .media-body>#content */ p {
margin:1rem 0 0;
color:#555
}
/* [data-is-baked="true"] .media-body>#content */ p>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ p>.title {
display:block;
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ a:not([role=button]) {
text-decoration:underline
}
/* [data-is-baked="true"] .media-body>#content */ img {
max-width:100%;
padding-top:1em;
padding-bottom:1em
}
/* [data-is-baked="true"] .media-body>#content */ pre {
text-align:left
}
/* [data-is-baked="true"] .media-body>#content */>section:first-child,
/* [data-is-baked="true"] .media-body>#content */>figure:first-child,
/* [data-is-baked="true"] .media-body>#content */>p:first-child,
/* [data-is-baked="true"] .media-body>#content */>.abstract:first-child,
/* [data-is-baked="true"] .media-body>#content */>table:first-child {
margin-top:0!important
}
/* [data-is-baked="true"] .media-body>#content */ section>section,
/* [data-is-baked="true"] .media-body>#content */ section>figure {
margin-top:3rem
}
/* [data-is-baked="true"] .media-body>#content */>figure,
/* [data-is-baked="true"] .media-body>#content */ :not(figure)>figure {
counter-increment:figure;
counter-reset:subfigure
}
/* [data-is-baked="true"] .media-body>#content */ figure {
position:relative;
color:#555;
text-align:center
}
/* [data-is-baked="true"] .media-body>#content */ figure>figcaption {
padding:1rem;
font-size:1.3rem
}
/* [data-is-baked="true"] .media-body>#content */ figure img {
max-width:100%;
padding:0
}
/* [data-is-baked="true"] .media-body>#content */ figure>[data-type="media"],
/* [data-is-baked="true"] .media-body>#content */ figure>.media {
display:block;
margin:0;
text-align:center
}
/* [data-is-baked="true"] .media-body>#content */ figure>figure {
counter-increment:subfigure
}
/* [data-is-baked="true"] .media-body>#content */ figure>figure:not(.ui-has-child-figcaption)::after {
position:relative;
display:block;
text-align:center;
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ figure:not([data-orient="vertical"]) {
position:relative;
display:table;
top:0;
table-layout:fixed
}
/* [data-is-baked="true"] .media-body>#content */ figure:not([data-orient="vertical"])>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ figure:not([data-orient="vertical"])>.title {
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ figure:not([data-orient="vertical"])>figcaption {
display:table-caption;
caption-side:bottom;
margin-bottom:1.5rem
}
/* [data-is-baked="true"] .media-body>#content */ figure:not([data-orient="vertical"])>figure {
display:table-cell
}
/* [data-is-baked="true"] .media-body>#content */ figure:not([data-orient="vertical"])>figure>figcaption {
display:block
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="term"],
/* [data-is-baked="true"] .media-body>#content */ .term {
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ .os-teacher {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="list"],
/* [data-is-baked="true"] .media-body>#content */ .list {
overflow-wrap:break-word
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="list"]>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .list>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="list"]>.title,
/* [data-is-baked="true"] .media-body>#content */ .list>.title {
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ .footnote {
font-size:1rem
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="footnote-ref"] {
text-indent:-27px;
padding-left:27px
}
/* [data-is-baked="true"] .media-body>#content */ .abstract {
position:relative;
background-color:#ededed;
padding:4.5rem 1.5rem 1.5rem;
margin:3rem 6rem 0
}
/* [data-is-baked="true"] .media-body>#content */ .abstract ul {
margin:1.5rem 0 0
}
/* [data-is-baked="true"] .media-body>#content */ .abstract ul::after {
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
/* [data-is-baked="true"] .media-body>#content */ blockquote {
font-size:14px
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .problem,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .problem,
/* [data-is-baked="true"] .media-body>#content */ .example .problem,
/* [data-is-baked="true"] .media-body>#content */ .exercise .problem,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .solution,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .solution,
/* [data-is-baked="true"] .media-body>#content */ .example .solution,
/* [data-is-baked="true"] .media-body>#content */ .exercise .solution {
padding:.5em 1em
}
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ .example .solution,
/* [data-is-baked="true"] .media-body>#content */ .exercise .solution {
border-top:.1rem solid #555
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="solution"]>.ui-toggle-wrapper,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="solution"]>.ui-toggle-wrapper,
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="solution"]>.ui-toggle-wrapper,
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="solution"]>.ui-toggle-wrapper,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .solution>.ui-toggle-wrapper,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .solution>.ui-toggle-wrapper,
/* [data-is-baked="true"] .media-body>#content */ .example .solution>.ui-toggle-wrapper,
/* [data-is-baked="true"] .media-body>#content */ .exercise .solution>.ui-toggle-wrapper {
text-align:center
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .solution>.ui-toggle-wrapper>.ui-toggle,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .solution>.ui-toggle-wrapper>.ui-toggle,
/* [data-is-baked="true"] .media-body>#content */ .example .solution>.ui-toggle-wrapper>.ui-toggle,
/* [data-is-baked="true"] .media-body>#content */ .exercise .solution>.ui-toggle-wrapper>.ui-toggle {
outline:0;
text-align:center;
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .example .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before {
content:'[Show Solution]'
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="solution"]:not(.ui-solution-visible)>section,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="solution"]:not(.ui-solution-visible)>section,
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="solution"]:not(.ui-solution-visible)>section,
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="solution"]:not(.ui-solution-visible)>section,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .solution:not(.ui-solution-visible)>section,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .solution:not(.ui-solution-visible)>section,
/* [data-is-baked="true"] .media-body>#content */ .example .solution:not(.ui-solution-visible)>section,
/* [data-is-baked="true"] .media-body>#content */ .exercise .solution:not(.ui-solution-visible)>section {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .example [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .example .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before {
content:'[Hide Solution]'
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].check-understanding [data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].check-understanding [data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example.check-understanding [data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.check-understanding [data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=check-understanding] .title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=check-understanding] .title::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=check-understanding] .title::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=check-understanding] .title::before {
margin-right:0;
content:""
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].conceptual-questions [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].conceptual-questions [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ .example.conceptual-questions [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ .exercise.conceptual-questions [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=conceptual-questions] .problem,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=conceptual-questions] .problem,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=conceptual-questions] .problem,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=conceptual-questions] .problem {
border-top:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].conceptual-questions [data-type="problem"] p,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].conceptual-questions [data-type="problem"] p,
/* [data-is-baked="true"] .media-body>#content */ .example.conceptual-questions [data-type="problem"] p,
/* [data-is-baked="true"] .media-body>#content */ .exercise.conceptual-questions [data-type="problem"] p,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=conceptual-questions] .problem p,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=conceptual-questions] .problem p,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=conceptual-questions] .problem p,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=conceptual-questions] .problem p {
margin:0
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example.problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].problems-exercises [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example.problems-exercises [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.problems-exercises [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=problems-exercises] [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="solution"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .example.problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=problems-exercises] .problem::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=problems-exercises] .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=problems-exercises] .problem::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].problems-exercises .solution::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].problems-exercises .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .example.problems-exercises .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.problems-exercises .solution::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=problems-exercises] .solution::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=problems-exercises] .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=problems-exercises] .solution::before {
font-weight:700;
color:#555;
text-transform:uppercase;
letter-spacing:.1rem
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example.problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.problems-exercises [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="problem"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .example.problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.problems-exercises .problem::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=problems-exercises] .problem::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=problems-exercises] .problem::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=problems-exercises] .problem::before {
content:"Problem"
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"].problems-exercises [data-type="solution"]::before .solution::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="solution"]::before .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .example.problems-exercises [data-type="solution"]::before .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise.problems-exercises [data-type="solution"]::before .solution::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="solution"]::before .solution::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="solution"]::before .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-type=problems-exercises] [data-type="solution"]::before .solution::before,
/* [data-is-baked="true"] .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="solution"]::before .solution::before {
content:"Solution"
}
/* [data-is-baked="true"] .media-body>#content */ .table-wrapper {
overflow-x:auto
}
/* [data-is-baked="true"] .media-body>#content */ table {
margin-top:6rem;
width:100%;
max-width:100%;
margin-bottom:20px;
background-color:transparent;
counter-increment:table
}
/* [data-is-baked="true"] .media-body>#content */ table caption {
margin-top:.5rem;
font-size:1.3rem;
text-align:left;
caption-side:bottom
}
/* [data-is-baked="true"] .media-body>#content */ table caption sup {
top:auto;
line-height:inherit
}
/* [data-is-baked="true"] .media-body>#content */ table caption>.title {
display:block;
font-size:1.6rem;
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ table caption>.title::before {
margin-right:.5rem;
color:#606163;
font-weight:700;
content:"Table " counter(table)"."
}
/* [data-is-baked="true"] .media-body>#content */ table thead tr>td[data-align="right"],
/* [data-is-baked="true"] .media-body>#content */ table tbody tr>td[data-align="right"] {
text-align:right
}
/* [data-is-baked="true"] .media-body>#content */ table tfoot>tr>th,
/* [data-is-baked="true"] .media-body>#content */ table tfoot>tr>td {
padding:1em;
line-height:1.42857143;
vertical-align:top;
border-top:.1rem solid #ddd
}
/* [data-is-baked="true"] .media-body>#content */ table thead>tr>th,
/* [data-is-baked="true"] .media-body>#content */ table thead>tr>td {
vertical-align:bottom;
border-bottom:.2rem solid #ddd;
font-weight:700;
text-align:left
}
/* [data-is-baked="true"] .media-body>#content */ table caption+thead tr:first-child th,
/* [data-is-baked="true"] .media-body>#content */ table colgroup+thead tr:first-child th,
/* [data-is-baked="true"] .media-body>#content */ table thead:first-child tr:first-child th,
/* [data-is-baked="true"] .media-body>#content */ table caption+thead tr:first-child td,
/* [data-is-baked="true"] .media-body>#content */ table colgroup+thead tr:first-child td,
/* [data-is-baked="true"] .media-body>#content */ table thead:first-child tr:first-child td {
border-top:0
}
/* [data-is-baked="true"] .media-body>#content */ table tbody+tbody {
border-top:.2rem solid #ddd
}
/* [data-is-baked="true"] .media-body>#content */ table table {
background-color:#fff
}
/* [data-is-baked="true"] .media-body>#content */ table>tbody>tr:nth-child(odd)>td,
/* [data-is-baked="true"] .media-body>#content */ table>tbody>tr:nth-child(odd)>th {
background-color:#f9f9f9
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="glossary"] [data-type="definition"] {
margin:1rem 3rem
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="equation"] {
overflow:auto
}
/* [data-is-baked="true"] .media-body>#content */ h1,
/* [data-is-baked="true"] .media-body>#content */ h2,
/* [data-is-baked="true"] .media-body>#content */ h3,
/* [data-is-baked="true"] .media-body>#content */ h4,
/* [data-is-baked="true"] .media-body>#content */ h5,
/* [data-is-baked="true"] .media-body>#content */ h6 {
margin:1.5rem 0 1rem;
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ h3+section {
margin-top:0
}
/* [data-is-baked="true"] .media-body>#content */ ul,
/* [data-is-baked="true"] .media-body>#content */ ol {
color:#555;
margin-bottom:1rem;
margin-top:1rem
}
/* [data-is-baked="true"] .media-body>#content */ .os-stepwise {
list-style-type:none;
padding-left:0
}
/* [data-is-baked="true"] .media-body>#content */ .os-stepwise>li {
display:flex
}
/* [data-is-baked="true"] .media-body>#content */ .os-stepwise>li .os-stepwise-token {
white-space:pre
}
/* [data-is-baked="true"] .media-body>#content */ .os-stepwise>li .os-stepwise-content>ul,
/* [data-is-baked="true"] .media-body>#content */ .os-stepwise>li .os-stepwise-content ol {
padding-left:1rem
}
/* [data-is-baked="true"] .media-body>#content */ .circled {
list-style-type:none;
padding-left:1rem
}
/* [data-is-baked="true"] .media-body>#content */ [data-bullet-style="none"] {
list-style-type:none
}
/* [data-is-baked="true"] .media-body>#content */ iframe {
display:block;
margin:3rem auto
}
/* [data-is-baked="true"] .media-body>#content */ .centered-text {
display:block;
text-align:center;
font-weight:400
}
/* [data-is-baked="true"] .media-body>#content */ .os-chapter-outline ul {
margin-top:0
}
/* [data-is-baked="true"] .media-body>#content */ .colored-text {
color:#c00
}
/* [data-is-baked="true"] .media-body>#content */ .no-emphasis {
font-weight:400
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="page"]>[data-type="document-title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="composite-page"]>[data-type="document-title"] {
display:none
}
/* [data-is-baked="true"] .media-body>#content */>section,
/* [data-is-baked="true"] .media-body>#content */>figure,
/* [data-is-baked="true"] .media-body>#content */>[data-type="glossary"],
/* [data-is-baked="true"] .media-body>#content */>[data-type="footnote-refs"] {
margin-top:6rem
}
/* [data-is-baked="true"] .media-body>#content */>section>ol>li::before,
/* [data-is-baked="true"] .media-body>#content */>figure>ol>li::before,
/* [data-is-baked="true"] .media-body>#content */>[data-type="glossary"]>ol>li::before,
/* [data-is-baked="true"] .media-body>#content */>[data-type="footnote-refs"]>ol>li::before {
content:""!important
}
/* [data-is-baked="true"] .media-body>#content */ .splash {
margin-top:0
}
/* [data-is-baked="true"] .media-body>#content */ .splash:not([data-orient="vertical"]) {
display:block
}
/* [data-is-baked="true"] .media-body>#content */ .splash:not([data-orient="vertical"]) img {
width:100%
}
/* [data-is-baked="true"] .media-body>#content */ .os-figure {
display:table;
margin:3rem auto
}
/* [data-is-baked="true"] .media-body>#content */ .os-figure .os-caption-container {
padding-top:1rem;
display:table-caption;
caption-side:bottom;
font-size:1.2rem;
color:#555
}
/* [data-is-baked="true"] .media-body>#content */ .os-figure .os-caption-container .os-title-label,
/* [data-is-baked="true"] .media-body>#content */ .os-figure .os-caption-container .os-number,
/* [data-is-baked="true"] .media-body>#content */ .os-figure .os-caption-container .os-title {
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ h1.example-title .text {
padding-left:1rem
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"],
/* [data-is-baked="true"] .media-body>#content */ .note {
margin:3rem 0;
padding:1.5rem;
background-color:#ededed;
border:.2rem solid #dcdcdc
}
@media (max-width:767px) {
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"],
/* [data-is-baked="true"] .media-body>#content */ .note {
 margin-left:0;
 margin-right:0
}
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]>p,
/* [data-is-baked="true"] .media-body>#content */ .note>p {
margin-top:0
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"],
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"] {
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
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"],
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"] {
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
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"],
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"] {
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
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]>section,
/* [data-is-baked="true"] .media-body>#content */ .note>section {
border-top:none;
padding:0 1.5rem;
background-color:#ededed;
color:#555
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]>section p,
/* [data-is-baked="true"] .media-body>#content */ .note>section p {
margin:0 0 1rem
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]>section ul,
/* [data-is-baked="true"] .media-body>#content */ .note>section ul,
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]>section ol,
/* [data-is-baked="true"] .media-body>#content */ .note>section ol {
color:#555
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"]>section span[data-type="media"],
/* [data-is-baked="true"] .media-body>#content */ .note>section span[data-type="media"] {
display:block;
margin:1rem 0
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"],
/* [data-is-baked="true"] .media-body>#content */ .example {
margin:3rem 0;
padding:1.5rem;
background-color:#ededed;
border:.2rem solid #dcdcdc
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]>p,
/* [data-is-baked="true"] .media-body>#content */ .example>p {
margin-top:0
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"],
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"] {
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
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"],
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"] {
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
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>.title,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"],
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"] {
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
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>.title::before,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
/* [data-is-baked="true"] .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]>section,
/* [data-is-baked="true"] .media-body>#content */ .example>section {
border-top:none;
padding:0 1.5rem;
background-color:#ededed;
color:#555
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]>section p,
/* [data-is-baked="true"] .media-body>#content */ .example>section p {
margin:0 0 1rem
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]>section ul,
/* [data-is-baked="true"] .media-body>#content */ .example>section ul,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]>section ol,
/* [data-is-baked="true"] .media-body>#content */ .example>section ol {
color:#555
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"]>section span[data-type="media"],
/* [data-is-baked="true"] .media-body>#content */ .example>section span[data-type="media"] {
display:block;
margin:1rem 0
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="problem"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ .problem,
/* [data-is-baked="true"] .media-body>#content */ .solution {
padding:0
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-problem-container,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-problem-container,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-problem-container,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-solution-container,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-solution-container,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-solution-container {
display:inline
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-problem-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-problem-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-problem-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-solution-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-solution-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure),
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-solution-container>:first-child:not(ul):not(ol):not([data-type="note"]):not(.os-figure) {
display:inline
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-problem-container>ul,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-problem-container>ul,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-problem-container>ul,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-solution-container>ul,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-solution-container>ul,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-solution-container>ul,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-problem-container>ol,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-problem-container>ol,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-problem-container>ol,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-solution-container>ol,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-solution-container>ol,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-solution-container>ol,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-problem-container [data-type="note"],
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-problem-container [data-type="note"],
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-problem-container [data-type="note"],
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-solution-container [data-type="note"],
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-solution-container [data-type="note"],
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-solution-container [data-type="note"] {
margin-top:0
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-problem-container .os-figure,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-problem-container .os-figure,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-problem-container .os-figure,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-solution-container .os-figure,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-solution-container .os-figure,
/* [data-is-baked="true"] .media-body>#content */ .section-exercises .os-solution-container .os-figure {
margin:3rem 0
}
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-solution-container img,
/* [data-is-baked="true"] .media-body>#content */ .os-eos .os-solution-container img,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-problem-container img,
/* [data-is-baked="true"] .media-body>#content */ .os-eos .os-problem-container img {
display:block
}
/* [data-is-baked="true"] .media-body>#content */ .review-questions [type="a"],
/* [data-is-baked="true"] .media-body>#content */ .os-review-questions-container [type="a"] {
list-style-type:upper-alpha
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="problem"] p:first-of-type {
display:inline
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="problem"] p:first-of-type a {
font-weight:700;
margin-right:.5em
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"] [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] [data-type="solution"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="note"] .solution,
/* [data-is-baked="true"] .media-body>#content */ [data-type="exercise"] .solution,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .solution {
border-top:.1rem solid #dcdcdc
}
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .os-solution-container,
/* [data-is-baked="true"] .media-body>#content */ [data-type="example"] .os-solution-container p {
margin-top:1rem
}
/* [data-is-baked="true"] .media-body>#content */ .equation,
/* [data-is-baked="true"] .media-body>#content */ [data-type="equation"] {
display:table;
width:100%
}
/* [data-is-baked="true"] .media-body>#content */ .equation .os-equation-number,
/* [data-is-baked="true"] .media-body>#content */ [data-type="equation"] .os-equation-number {
display:table-cell;
vertical-align:middle;
width:5%
}
/* [data-is-baked="true"] .media-body>#content */ .equation .os-equation-number .os-number,
/* [data-is-baked="true"] .media-body>#content */ [data-type="equation"] .os-equation-number .os-number {
border:#000 solid 1px;
padding:5px;
text-align:center;
vertical-align:middle
}
/* [data-is-baked="true"] .media-body>#content */ .equation [data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ [data-type="equation"] [data-type="title"] {
display:block;
text-align:center;
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ .os-note-body img {
display:block
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table thead tr th .MathJax_Display {
width:auto!important;
float:left!important;
margin:0
}
/* [data-is-baked="true"] .media-body>#content */ .swipe-table {
-webkit-touch-callout:none;
-webkit-user-select:none;
-khtml-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none;
cursor:-webkit-grab
}
/* [data-is-baked="true"] .media-body>#content */ .os-table {
overflow-x:auto;
margin:20px 0
}
/* [data-is-baked="true"] .media-body>#content */ .os-table .os-table-title {
text-align:center;
font-weight:700;
padding-bottom:1em
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table {
margin:0
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table.has-images {
table-layout:fixed
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table tr td,
/* [data-is-baked="true"] .media-body>#content */ .os-table table tr th {
padding:1em
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table tr td {
vertical-align:middle
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table tr [data-valign="top"] {
vertical-align:top
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table tr [data-align="center"] {
text-align:center
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table ul,
/* [data-is-baked="true"] .media-body>#content */ .os-table table ol {
padding-left:1.5em
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table ul[data-bullet-style="none"],
/* [data-is-baked="true"] .media-body>#content */ .os-table table ol[data-bullet-style="none"] {
padding:0;
margin:0
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table ul[data-bullet-style="none"] li,
/* [data-is-baked="true"] .media-body>#content */ .os-table table ol[data-bullet-style="none"] li {
list-style:none
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table .os-figure,
/* [data-is-baked="true"] .media-body>#content */ .os-table table .os-figure img {
margin:0
}
/* [data-is-baked="true"] .media-body>#content */ .os-table table .os-figure .os-caption-container {
padding:1rem 0 0
}
/* [data-is-baked="true"] .media-body>#content */ .os-table .os-caption-container {
font-size:.9em;
padding:8px;
border-top:.1rem solid #dcdcdc
}
/* [data-is-baked="true"] .media-body>#content */ .os-table .os-caption-container .os-title-label,
/* [data-is-baked="true"] .media-body>#content */ .os-table .os-caption-container .os-number {
font-weight:700;
display:inline-block;
padding-right:.25em
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc h2[data-type="document-title"],
/* [data-is-baked="true"] .media-body>#content */ .os-eob h2[data-type="document-title"],
/* [data-is-baked="true"] .media-body>#content */ .os-eoc h2.os-title,
/* [data-is-baked="true"] .media-body>#content */ .os-eob h2.os-title {
font-size:2.1rem;
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .os-number,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .os-number {
font-weight:700;
text-decoration:none
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .group-by .os-index-item:not(:first-of-type),
/* [data-is-baked="true"] .media-body>#content */ .os-eob .group-by .os-index-item:not(:first-of-type) {
margin-top:.5rem
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .group-by .os-index-item .os-term,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .group-by .os-index-item .os-term {
font-weight:700;
padding-right:.5rem
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .group-label,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .group-label {
display:block;
font-size:2.1rem;
font-weight:700;
margin:1.5rem 0 1rem
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc.os-reference-container>.os-chapter-area>.reference span.os-reference-number,
/* [data-is-baked="true"] .media-body>#content */ .os-eob.os-reference-container>.os-chapter-area>.reference span.os-reference-number,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc.os-references-container .references .os-note-body>a,
/* [data-is-baked="true"] .media-body>#content */ .os-eob.os-references-container .references .os-note-body>a {
margin-right:10px
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc [data-type="list"]>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .os-eob [data-type="list"]>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .list>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .os-eob .list>[data-type="title"],
/* [data-is-baked="true"] .media-body>#content */ .os-eoc [data-type="list"]>.title,
/* [data-is-baked="true"] .media-body>#content */ .os-eob [data-type="list"]>.title,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .list>.title,
/* [data-is-baked="true"] .media-body>#content */ .os-eob .list>.title {
margin-top:15px
}
/* [data-is-baked="true"] .media-body>#content */ .os-reference-number {
font-weight:700
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc [data-type="exercise"] [data-type="problem"]>.number,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .exercise [data-type="problem"]>.number {
font-weight:700;
text-decoration:none
}
/* [data-is-baked="true"] .media-body>#content */ .os-eoc [data-type="exercise"] img,
/* [data-is-baked="true"] .media-body>#content */ .os-eoc .exercise img {
display:block;
margin-bottom:1em
}
/* [data-is-baked="true"] .media-body>#content */ .os-solutions-container [data-type="solution"] {
padding:.5em .25em .5em 0
}
/* [data-is-baked="true"] .media-body>#content */ .os-solutions-container [data-type="solution"]>a {
font-weight:700;
text-decoration:none
}
/* [data-is-baked="true"] .media-body>#content */ .os-solutions-container [data-type="solution"] p {
display:inline
}
/* [data-is-baked="true"] .media-body>#content */ .os-solutions-container [data-type="solution"] p::before {
content:" "
}
/* [data-is-baked="true"] .media-body>#content */ .os-chapter-area [data-type="solution"] p {
display:inline
}
/* [data-is-baked="true"] .media-body>#content */ .appendix [data-type="list"] {
margin-top:1rem
}
/* [data-is-baked="true"] .media-body>#content */ figure.scaled-down,
/* [data-is-baked="true"] .media-body>#content */ figure.scaled-down~.os-caption-container {
width:60%;
margin:auto
}
/* [data-is-baked="true"] .media-body>#content */ figure.scaled-down-30,
/* [data-is-baked="true"] .media-body>#content */ figure.scaled-down-30~.os-caption-container {
width:30%;
margin:auto
}
/* [data-is-baked="true"] .media-body>#content */ :not(figure)>[data-type="media"].scaled-down {
text-align:center;
display:block
}
/* [data-is-baked="true"] .media-body>#content */ :not(figure)>[data-type="media"].scaled-down img {
width:60%
}
/* [data-is-baked="true"] .media-body>#content */ :not(figure)>[data-type="media"].scaled-down-30 {
text-align:center;
display:block
}
/* [data-is-baked="true"] .media-body>#content */ :not(figure)>[data-type="media"].scaled-down-30 img {
width:30%
}
/* [data-is-baked="true"] .media-body>#content */ .learning-objectives {
margin:3rem 0;
padding:1.5rem;
background-color:#ededed;
border:.2rem solid #dcdcdc
}
/* [data-is-baked="true"] .media-body>#content */ .learning-objectives [data-type="title"] {
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
/* [data-is-baked="true"] .media-body>#content */ .learning-objectives p {
color:#555;
margin:0 0 1rem 1.5rem
}
/* [data-is-baked="true"] .media-body>#content */ .not-converted-yet {
visibility:hidden
}
[data-is-baked="false"] /* .media-body>#content */ h1,
[data-is-baked="false"] /* .media-body>#content */ h2,
[data-is-baked="false"] /* .media-body>#content */ h3,
[data-is-baked="false"] /* .media-body>#content */ h4,
[data-is-baked="false"] /* .media-body>#content */ h5,
[data-is-baked="false"] /* .media-body>#content */ h6 {
color:#333
}
[data-is-baked="false"] /* .media-body>#content */ p {
margin:1rem 0 0;
color:#555
}
[data-is-baked="false"] /* .media-body>#content */ p>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ p>.title {
display:block;
font-weight:700
}
[data-is-baked="false"] /* .media-body>#content */ a:not([role=button]) {
text-decoration:underline
}
[data-is-baked="false"] /* .media-body>#content */ img {
max-width:100%;
padding-top:1em;
padding-bottom:1em
}
[data-is-baked="false"] /* .media-body>#content */ pre {
text-align:left
}
[data-is-baked="false"] /* .media-body>#content */>section:first-child,
[data-is-baked="false"] /* .media-body>#content */>figure:first-child,
[data-is-baked="false"] /* .media-body>#content */>p:first-child,
[data-is-baked="false"] /* .media-body>#content */>.abstract:first-child,
[data-is-baked="false"] /* .media-body>#content */>table:first-child {
margin-top:0!important
}
[data-is-baked="false"] /* .media-body>#content */ section>section,
[data-is-baked="false"] /* .media-body>#content */ section>figure {
margin-top:3rem
}
[data-is-baked="false"] /* .media-body>#content */>figure,
[data-is-baked="false"] /* .media-body>#content */ :not(figure)>figure {
counter-increment:figure;
counter-reset:subfigure
}
[data-is-baked="false"] /* .media-body>#content */ figure {
position:relative;
color:#555;
text-align:center
}
[data-is-baked="false"] /* .media-body>#content */ figure>figcaption {
padding:1rem;
font-size:1.3rem
}
[data-is-baked="false"] /* .media-body>#content */ figure img {
max-width:100%;
padding:0
}
[data-is-baked="false"] /* .media-body>#content */ figure>[data-type="media"],
[data-is-baked="false"] /* .media-body>#content */ figure>.media {
display:block;
margin:0;
text-align:center
}
[data-is-baked="false"] /* .media-body>#content */ figure>figure {
counter-increment:subfigure
}
[data-is-baked="false"] /* .media-body>#content */ figure>figure:not(.ui-has-child-figcaption)::after {
position:relative;
display:block;
text-align:center;
font-weight:700
}
[data-is-baked="false"] /* .media-body>#content */ figure:not([data-orient="vertical"]) {
position:relative;
display:table;
top:0;
table-layout:fixed
}
[data-is-baked="false"] /* .media-body>#content */ figure:not([data-orient="vertical"])>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ figure:not([data-orient="vertical"])>.title {
font-weight:700
}
[data-is-baked="false"] /* .media-body>#content */ figure:not([data-orient="vertical"])>figcaption {
display:table-caption;
caption-side:bottom;
margin-bottom:1.5rem
}
[data-is-baked="false"] /* .media-body>#content */ figure:not([data-orient="vertical"])>figure {
display:table-cell
}
[data-is-baked="false"] /* .media-body>#content */ figure:not([data-orient="vertical"])>figure>figcaption {
display:block
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="term"],
[data-is-baked="false"] /* .media-body>#content */ .term {
font-weight:700
}
[data-is-baked="false"] /* .media-body>#content */ .os-teacher {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="list"],
[data-is-baked="false"] /* .media-body>#content */ .list {
overflow-wrap:break-word
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="list"]>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .list>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="list"]>.title,
[data-is-baked="false"] /* .media-body>#content */ .list>.title {
font-weight:700
}
[data-is-baked="false"] /* .media-body>#content */ .footnote {
font-size:1rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="footnote-ref"] {
text-indent:-27px;
padding-left:27px
}
[data-is-baked="false"] /* .media-body>#content */ .abstract {
position:relative;
background-color:#ededed;
padding:4.5rem 1.5rem 1.5rem;
margin:3rem 6rem 0
}
[data-is-baked="false"] /* .media-body>#content */ .abstract ul {
margin:1.5rem 0 0
}
[data-is-baked="false"] /* .media-body>#content */ .abstract ul::after {
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
[data-is-baked="false"] /* .media-body>#content */ blockquote {
font-size:14px
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .problem,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .problem,
[data-is-baked="false"] /* .media-body>#content */ .example .problem,
[data-is-baked="false"] /* .media-body>#content */ .exercise .problem,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .solution,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .solution,
[data-is-baked="false"] /* .media-body>#content */ .example .solution,
[data-is-baked="false"] /* .media-body>#content */ .exercise .solution {
padding:.5em 1em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="solution"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .solution,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .solution,
[data-is-baked="false"] /* .media-body>#content */ .example .solution,
[data-is-baked="false"] /* .media-body>#content */ .exercise .solution {
border-top:.1rem solid #555
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="solution"]>.ui-toggle-wrapper,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="solution"]>.ui-toggle-wrapper,
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="solution"]>.ui-toggle-wrapper,
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="solution"]>.ui-toggle-wrapper,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .solution>.ui-toggle-wrapper,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .solution>.ui-toggle-wrapper,
[data-is-baked="false"] /* .media-body>#content */ .example .solution>.ui-toggle-wrapper,
[data-is-baked="false"] /* .media-body>#content */ .exercise .solution>.ui-toggle-wrapper {
text-align:center
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="solution"]>.ui-toggle-wrapper>.ui-toggle,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .solution>.ui-toggle-wrapper>.ui-toggle,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .solution>.ui-toggle-wrapper>.ui-toggle,
[data-is-baked="false"] /* .media-body>#content */ .example .solution>.ui-toggle-wrapper>.ui-toggle,
[data-is-baked="false"] /* .media-body>#content */ .exercise .solution>.ui-toggle-wrapper>.ui-toggle {
outline:0;
text-align:center;
font-weight:700
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="solution"]:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .example .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise .solution:not(.ui-solution-visible)>.ui-toggle-wrapper>button.ui-toggle::before {
content:'[Show Solution]'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="solution"]:not(.ui-solution-visible)>section,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="solution"]:not(.ui-solution-visible)>section,
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="solution"]:not(.ui-solution-visible)>section,
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="solution"]:not(.ui-solution-visible)>section,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .solution:not(.ui-solution-visible)>section,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .solution:not(.ui-solution-visible)>section,
[data-is-baked="false"] /* .media-body>#content */ .example .solution:not(.ui-solution-visible)>section,
[data-is-baked="false"] /* .media-body>#content */ .exercise .solution:not(.ui-solution-visible)>section {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .example [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise [data-type="solution"].ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"] .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"] .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .example .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise .solution.ui-solution-visible>.ui-toggle-wrapper>button.ui-toggle::before {
content:'[Hide Solution]'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].check-understanding [data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].check-understanding [data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example.check-understanding [data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.check-understanding [data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=check-understanding] .title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=check-understanding] .title::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=check-understanding] .title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=check-understanding] .title::before {
margin-right:0;
content:""
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].conceptual-questions [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].conceptual-questions [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ .example.conceptual-questions [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ .exercise.conceptual-questions [data-type="problem"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=conceptual-questions] .problem,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=conceptual-questions] .problem,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=conceptual-questions] .problem,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=conceptual-questions] .problem {
border-top:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].conceptual-questions [data-type="problem"] p,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].conceptual-questions [data-type="problem"] p,
[data-is-baked="false"] /* .media-body>#content */ .example.conceptual-questions [data-type="problem"] p,
[data-is-baked="false"] /* .media-body>#content */ .exercise.conceptual-questions [data-type="problem"] p,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=conceptual-questions] .problem p,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=conceptual-questions] .problem p,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=conceptual-questions] .problem p,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=conceptual-questions] .problem p {
margin:0
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example.problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].problems-exercises [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example.problems-exercises [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.problems-exercises [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=problems-exercises] [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="solution"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .example.problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=problems-exercises] .problem::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=problems-exercises] .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=problems-exercises] .problem::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].problems-exercises .solution::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].problems-exercises .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .example.problems-exercises .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.problems-exercises .solution::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=problems-exercises] .solution::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=problems-exercises] .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=problems-exercises] .solution::before {
font-weight:700;
color:#555;
text-transform:uppercase;
letter-spacing:.1rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example.problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.problems-exercises [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="problem"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .example.problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.problems-exercises .problem::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=problems-exercises] .problem::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=problems-exercises] .problem::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=problems-exercises] .problem::before {
content:"Problem"
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"].problems-exercises [data-type="solution"]::before .solution::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"].problems-exercises [data-type="solution"]::before .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .example.problems-exercises [data-type="solution"]::before .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise.problems-exercises [data-type="solution"]::before .solution::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-type=problems-exercises] [data-type="solution"]::before .solution::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-type=problems-exercises] [data-type="solution"]::before .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-type=problems-exercises] [data-type="solution"]::before .solution::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-type=problems-exercises] [data-type="solution"]::before .solution::before {
content:"Solution"
}
[data-is-baked="false"] /* .media-body>#content */ .table-wrapper {
overflow-x:auto
}
[data-is-baked="false"] /* .media-body>#content */ table {
margin-top:6rem;
width:100%;
max-width:100%;
margin-bottom:20px;
background-color:transparent;
counter-increment:table
}
[data-is-baked="false"] /* .media-body>#content */ table caption {
margin-top:.5rem;
font-size:1.3rem;
text-align:left;
caption-side:bottom
}
[data-is-baked="false"] /* .media-body>#content */ table caption sup {
top:auto;
line-height:inherit
}
[data-is-baked="false"] /* .media-body>#content */ table caption>.title {
display:block;
font-size:1.6rem;
font-weight:700
}
[data-is-baked="false"] /* .media-body>#content */ table caption>.title::before {
margin-right:.5rem;
color:#606163;
font-weight:700;
content:"Table " counter(table)"."
}
[data-is-baked="false"] /* .media-body>#content */ table thead tr>td[data-align="right"],
[data-is-baked="false"] /* .media-body>#content */ table tbody tr>td[data-align="right"] {
text-align:right
}
[data-is-baked="false"] /* .media-body>#content */ table tfoot>tr>th,
[data-is-baked="false"] /* .media-body>#content */ table tfoot>tr>td {
padding:1em;
line-height:1.42857143;
vertical-align:top;
border-top:.1rem solid #ddd
}
[data-is-baked="false"] /* .media-body>#content */ table thead>tr>th,
[data-is-baked="false"] /* .media-body>#content */ table thead>tr>td {
vertical-align:bottom;
border-bottom:.2rem solid #ddd;
font-weight:700;
text-align:left
}
[data-is-baked="false"] /* .media-body>#content */ table caption+thead tr:first-child th,
[data-is-baked="false"] /* .media-body>#content */ table colgroup+thead tr:first-child th,
[data-is-baked="false"] /* .media-body>#content */ table thead:first-child tr:first-child th,
[data-is-baked="false"] /* .media-body>#content */ table caption+thead tr:first-child td,
[data-is-baked="false"] /* .media-body>#content */ table colgroup+thead tr:first-child td,
[data-is-baked="false"] /* .media-body>#content */ table thead:first-child tr:first-child td {
border-top:0
}
[data-is-baked="false"] /* .media-body>#content */ table tbody+tbody {
border-top:.2rem solid #ddd
}
[data-is-baked="false"] /* .media-body>#content */ table table {
background-color:#fff
}
[data-is-baked="false"] /* .media-body>#content */ table>tbody>tr:nth-child(odd)>td,
[data-is-baked="false"] /* .media-body>#content */ table>tbody>tr:nth-child(odd)>th {
background-color:#f9f9f9
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="glossary"] [data-type="definition"] {
margin:1rem 3rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="equation"] {
overflow:auto
}
[data-is-baked="false"] /* .media-body>#content */ h1,
[data-is-baked="false"] /* .media-body>#content */ h2,
[data-is-baked="false"] /* .media-body>#content */ h3,
[data-is-baked="false"] /* .media-body>#content */ h4,
[data-is-baked="false"] /* .media-body>#content */ h5,
[data-is-baked="false"] /* .media-body>#content */ h6 {
margin-bottom:1.5rem
}
[data-is-baked="false"] /* .media-body>#content */>section,
[data-is-baked="false"] /* .media-body>#content */>figure,
[data-is-baked="false"] /* .media-body>#content */>[data-type="glossary"],
[data-is-baked="false"] /* .media-body>#content */>[data-type="footnote-refs"] {
margin-top:6rem
}
[data-is-baked="false"] /* .media-body>#content */>section>ol,
[data-is-baked="false"] /* .media-body>#content */>figure>ol,
[data-is-baked="false"] /* .media-body>#content */>[data-type="glossary"]>ol,
[data-is-baked="false"] /* .media-body>#content */>[data-type="footnote-refs"]>ol {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ figure.ui-has-child-figcaption>figcaption::before,
[data-is-baked="false"] /* .media-body>#content */ figure:not(.ui-has-child-figcaption)::after {
margin-right:.5rem;
color:#606163;
font-weight:700;
content:"Figure " counter(figure)"."
}
[data-is-baked="false"] /* .media-body>#content */ figure>figure.ui-has-child-figcaption>figcaption::before {
font-weight:700;
content:counter(figure) counter(subfigure,lower-alpha)': '
}
[data-is-baked="false"] /* .media-body>#content */ figure>figure:not(.ui-has-child-figcaption)::after {
content:'(' counter(subfigure,lower-alpha)')'
}
[data-is-baked="false"] /* .media-body>#content */ figure:not([data-orient="vertical"]) {
width:100%
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="pilcrow"] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="pilcrow"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="pilcrow"]>li::before {
content:'\00b6';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="rpilcrow"] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="rpilcrow"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="rpilcrow"]>li::before {
content:'\204b';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="section"] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="section"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="section"]>li::before {
content:'\00a7';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="asterisk"] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="asterisk"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="asterisk"]>li::before {
content:'*';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="dash"] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="dash"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="dash"]>li::before {
content:'-';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="none"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="none"]>li::before {
content:none;
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="none"] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style]:not([data-bullet-style='bullet']):not([data-bullet-style='open-circle']):not([data-bullet-style='pilcrow']):not([data-bullet-style='rpilcrow']):not([data-bullet-style='section']):not([data-bullet-style='asterisk']):not([data-bullet-style='dash']):not([data-bullet-style='none'])::before {
content:'[' 'data-bullet-style=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="bullet"] {
list-style-type:disc
}
[data-is-baked="false"] /* .media-body>#content */ ul:not([data-display='inline'])[data-bullet-style="open-circle"] {
list-style-type:circle
}
[data-is-baked="false"] /* .media-body>#content */ ol:not([data-display='inline'])[data-number-style="arabic"] {
list-style-type:decimal
}
[data-is-baked="false"] /* .media-body>#content */ ol:not([data-display='inline'])[data-number-style="upper-alpha"] {
list-style-type:upper-alpha
}
[data-is-baked="false"] /* .media-body>#content */ ol:not([data-display='inline'])[data-number-style="lower-alpha"] {
list-style-type:lower-alpha
}
[data-is-baked="false"] /* .media-body>#content */ ol:not([data-display='inline'])[data-number-style="upper-roman"] {
list-style-type:upper-roman
}
[data-is-baked="false"] /* .media-body>#content */ ol:not([data-display='inline'])[data-number-style="lower-roman"] {
list-style-type:lower-roman
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-labeled-item] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'] {
display:inline;
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="pilcrow"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="pilcrow"]>[data-type="item"]::before {
content:'\00b6';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="rpilcrow"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="rpilcrow"]>[data-type="item"]::before {
content:'\204b';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="section"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="section"]>[data-type="item"]::before {
content:'\00a7';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="asterisk"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="asterisk"]>[data-type="item"]::before {
content:'*';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="dash"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="dash"]>[data-type="item"]::before {
content:'-';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="none"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="none"]>[data-type="item"]::before {
content:none;
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style]:not([data-bullet-style='bullet']):not([data-bullet-style='open-circle']):not([data-bullet-style='pilcrow']):not([data-bullet-style='rpilcrow']):not([data-bullet-style='section']):not([data-bullet-style='asterisk']):not([data-bullet-style='dash']):not([data-bullet-style='none'])::before {
content:'[' 'data-bullet-style=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline']>li {
display:inline
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline']:not([data-item-sep])>span[data-type="item"]:not(:last-child)::after {
content:';'
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-item-sep]>[data-type="item"]:not(:last-child)::after {
content:'[' 'data-item-sep=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="bullet"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="bullet"]>[data-type="item"]::before {
content:'\25cf';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="open-circle"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-bullet-style="open-circle"]>[data-type="item"]::before {
content:'\25cb';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline']>[data-type="item"]::before {
content:'\25cf';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'] {
display:inline;
counter-reset:list-item;
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline']>li {
display:inline
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline']:not([data-item-sep])>span[data-type="item"]:not(:last-child)::after {
content:';'
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-item-sep]>[data-type="item"]:not(:last-child)::after {
content:'[' 'data-item-sep=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline']>[data-type="item"],
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline']>li {
counter-increment:list-item
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="arabic"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="arabic"]>li::before {
content:attr(data-mark-prefix) counter(list-item,decimal) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="arabic"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="arabic"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,decimal)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-alpha"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-alpha"]>li::before {
content:attr(data-mark-prefix) counter(list-item,upper-alpha) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-alpha"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-alpha"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,upper-alpha)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-alpha"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-alpha"]>li::before {
content:attr(data-mark-prefix) counter(list-item,lower-alpha) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-alpha"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-alpha"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,lower-alpha)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-roman"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-roman"]>li::before {
content:attr(data-mark-prefix) counter(list-item,upper-roman) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-roman"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="upper-roman"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,upper-roman)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-roman"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-roman"]>li::before {
content:attr(data-mark-prefix) counter(list-item,lower-roman) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-roman"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ ol[data-display='inline'][data-number-style="lower-roman"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,lower-roman)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-labeled-item] {
display:inline;
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-labeled-item]>li {
display:inline
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-labeled-item]:not([data-item-sep])>span[data-type="item"]:not(:last-child)::after {
content:';'
}
[data-is-baked="false"] /* .media-body>#content */ ul[data-display='inline'][data-labeled-item][data-item-sep]>[data-type="item"]:not(:last-child)::after {
content:'[' 'data-item-sep=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item]) {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item]):not([data-item-sep])>span[data-type="item"]:not(:last-child)::after {
content:';'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item])[data-item-sep]>[data-type="item"]:not(:last-child)::after {
content:'[' 'data-item-sep=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item])[data-bullet-style="bullet"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item])[data-bullet-style="bullet"]>[data-type="item"]::before {
content:'\25cf';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item])[data-bullet-style="open-circle"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item])[data-bullet-style="open-circle"]>[data-type="item"]::before {
content:'\25cb';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list']:not([data-list-type]):not([data-labeled-item])>[data-type="item"]::before {
content:'\25cf';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted'] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted']:not([data-item-sep])>span[data-type="item"]:not(:last-child)::after {
content:';'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted'][data-item-sep]>[data-type="item"]:not(:last-child)::after {
content:'[' 'data-item-sep=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted'][data-bullet-style="bullet"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted'][data-bullet-style="bullet"]>[data-type="item"]::before {
content:'\25cf';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted'][data-bullet-style="open-circle"]>li::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted'][data-bullet-style="open-circle"]>[data-type="item"]::before {
content:'\25cb';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='bulleted']>[data-type="item"]::before {
content:'\25cf';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'] {
counter-reset:list-item;
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated']:not([data-item-sep])>span[data-type="item"]:not(:last-child)::after {
content:';'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-item-sep]>[data-type="item"]:not(:last-child)::after {
content:'[' 'data-item-sep=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated']>[data-type="item"],
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated']>li {
counter-increment:list-item
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="arabic"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="arabic"]>li::before {
content:attr(data-mark-prefix) counter(list-item,decimal) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="arabic"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="arabic"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,decimal)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-alpha"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-alpha"]>li::before {
content:attr(data-mark-prefix) counter(list-item,upper-alpha) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-alpha"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-alpha"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,upper-alpha)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-alpha"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-alpha"]>li::before {
content:attr(data-mark-prefix) counter(list-item,lower-alpha) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-alpha"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-alpha"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,lower-alpha)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-roman"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-roman"]>li::before {
content:attr(data-mark-prefix) counter(list-item,upper-roman) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-roman"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="upper-roman"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,upper-roman)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-roman"]>[data-type="item"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-roman"]>li::before {
content:attr(data-mark-prefix) counter(list-item,lower-roman) attr(data-mark-suffix)'. '
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-roman"]>[data-type="item"]:not([data-mark-prefix]):not([data-mark-suffix])::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='enumerated'][data-number-style="lower-roman"]>li:not([data-mark-prefix]):not([data-mark-suffix])::before {
content:counter(list-item,lower-roman)'.';
margin-right:.5em
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='labeled-item'] {
list-style-type:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='labeled-item']:not([data-item-sep])>span[data-type="item"]:not(:last-child)::after {
content:';'
}
[data-is-baked="false"] /* .media-body>#content */ [data-type='list'][data-list-type='labeled-item'][data-item-sep]>[data-type="item"]:not(:last-child)::after {
content:'[' 'data-item-sep=CUSTOM' ' NOT_IMPLEMENTED_YET' ']'
}
[data-is-baked="false"] /* .media-body>#content */ div[data-type='list'][data-list-type] {
padding-left:2.5rem;
margin-bottom:1rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"],
[data-is-baked="false"] /* .media-body>#content */ .note {
margin:3rem 6rem 0;
padding:1.5rem;
background-color:#ededed
}
@media (max-width:767px) {
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"],
[data-is-baked="false"] /* .media-body>#content */ .note {
 margin-left:0;
 margin-right:0
}
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
text-transform:uppercase;
letter-spacing:.1rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
text-transform:uppercase;
letter-spacing:.1rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
color:#555;
font-size:1.5rem;
text-transform:uppercase;
letter-spacing:.1rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .note[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="note"]>section,
[data-is-baked="false"] /* .media-body>#content */ .note>section {
padding:.5rem 1.5rem;
border-top:.1rem solid #555;
background-color:#ededed
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"],
[data-is-baked="false"] /* .media-body>#content */ .example {
margin-top:3rem
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
padding:.1em 1em;
font-weight:700;
color:#ededed;
background-color:#555
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
padding:.1em 1em;
font-weight:700;
color:#ededed;
background-color:#555
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block;
padding:.1em 1em;
font-weight:700;
color:#ededed;
background-color:#555
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .example[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="example"]>section,
[data-is-baked="false"] /* .media-body>#content */ .example>section {
padding:.5rem 1.5rem;
border-top:.1rem solid #555;
background-color:#ededed
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise:not([data-label]).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label=''].ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"],
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>header>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>header>.os-title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>.title,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"],
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"] {
display:inline-block
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>header>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>[data-type="title"]::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>header>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>header>.os-title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title>.title::before,
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"][data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before,
[data-is-baked="false"] /* .media-body>#content */ .exercise[data-label]:not([data-label='']).ui-has-child-title .solution>section>[data-type="solution-title"]::before {
display:none
}
[data-is-baked="false"] /* .media-body>#content */ [data-type="exercise"]>section,
[data-is-baked="false"] /* .media-body>#content */ .exercise>section {
padding:.5rem 1.5rem;
border-top:.1rem solid #555;
background-color:#ededed
}
.media-footer>.downloads {
position:relative
}
.content-display {
display:none
}
.media-footer>.history {
position:relative
}
.clearfix:before,
.clearfix:after {
display:table
}
.media-footer>.attribution {
position:relative
}
.media-footer>.attribution ul>li {
margin-bottom:1rem
}
.clearfix:before,
.clearfix:after {
display:table
}
.metadata.tab-content>div {
position:relative
}
.media-tabs .metadata {
position:relative;
padding:5rem 4rem 3rem;
color:#000
}
.media-tabs .metadata .book-page-toggle {
position:absolute;
right:4rem;
top:2rem
}
.media-tabs .metadata .book-page-toggle .btn {
color:#000;
border:.1rem solid #ededed;
background-color:#fff
}
.media-tabs .metadata .book-page-toggle .btn:focus {
border-color:lightblue
}
.media-tabs .metadata .book-page-toggle .active {
color:#000;
border:.1rem solid transparent;
background-color:#ededed
}
.media-tabs .metadata>div>dl {
margin-bottom:0
}
.media-tabs .metadata>div>dl>dt {
padding:1rem 0;
width:22.5rem;
text-align:left;
color:#333
}
.media-tabs .metadata>div>dl>dd {
margin:0;
border-bottom:.1rem solid #dcdcdc
}
.media-tabs .metadata>div>dl>dd:last-child {
border:none
}
.media-tabs .metadata>div>dl>dd>div {
padding:1rem 1rem 1rem 22.5rem
}
.media-tabs .metadata>div>dl>dd>div>ul {
padding:0 0 0 1.5rem
}
.media-tabs .metadata>div>dl>dd .pending {
background:rgba(243,207,54,.75)!important;
font-style:italic
}
.media-tabs .metadata>div>dl>dd .rejected {
background:rgba(217,83,79,.75)!important;
text-decoration:line-through
}
.media-tabs .metadata>div>dl .summary {
min-height:2.75rem;
background-color:#fff
}
.media-tabs .metadata>div>dl [contenteditable="true"] {
border:.1rem solid #aaa;
border-radius:.4rem
}
.dl-metadata>dt {
margin-top:5px;
white-space:normal;
text-overflow:inherit
}
.dl-metadata>dd {
margin-top:5px
}
@media (max-width:1199px) {
.sidebar-open .media-footer .tab-content {
 overflow:auto
}
.sidebar-open .media-footer .tab-content .book-page-toggle {
 position:relative;
 margin-bottom:1rem
}
.sidebar-open .dl-horizontal dt {
 text-align:left
}
.sidebar-open .dl-horizontal dd {
 margin-left:0;
 clear:both
}
}
@media (max-width:767px) {
.media-footer .tab-content {
 overflow:auto
}
.media-footer .tab-content .book-page-toggle {
 position:relative;
 margin-bottom:1rem
}
.dl-horizontal dt {
 text-align:left
}
.dl-horizontal dd {
 margin-left:0;
 clear:both
}
}
.clearfix:before,
.clearfix:after {
display:table
}
.media-footer {
margin:4rem 6rem 6rem
}
.media-footer h2 {
margin-bottom:2rem;
font-weight:300
}
.media-footer>ul {
margin:0 0 3rem;
padding:0 0 0 3rem;
font-size:0;
list-style-type:none;
color:#21366b;
border-bottom:.1rem solid #cdcdcd
}
.media-footer>ul>li {
display:inline-block;
padding:.7rem 1rem;
margin-right:.3rem;
margin-top:.3rem;
font-size:1.4rem;
background-color:#ededed;
cursor:pointer;
-webkit-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none
}
.media-footer>ul>li>.tab-title {
margin-left:.2rem;
vertical-align:middle
}
.media-footer>ul>li>.tab-title::after {
font-weight:700;
margin-left:.5rem;
vertical-align:top;
content:"+"
}
.media-footer>ul>li:focus {
outline:1px;
outline-style:solid
}
.media-footer>ul>li.active,
.media-footer>ul>li.active>button {
color:#ededed;
background-color:#21366b
}
.media-footer>ul>li.active>.tab-title::after,
.media-footer>ul>li.active>button>.tab-title::after {
content:"\2212"
}
.media-footer>ul>li.disabled {
cursor:not-allowed;
pointer-events:none;
opacity:.65
}
.media-footer>.tab-content {
display:none;
padding-bottom:4rem;
margin-bottom:4rem;
background-color:#fff;
border-bottom:.1rem solid #cdcdcd
}
.media-footer .book-page-toggle {
position:absolute;
right:0;
top:0
}
.media-footer .book-page-toggle .btn {
color:#000;
border:.1rem solid #ededed;
background-color:#fff
}
.media-footer .book-page-toggle .btn:focus {
border-color:lightblue
}
.media-footer .book-page-toggle .active {
color:#000;
border:.1rem solid transparent;
background-color:#ededed
}
.media-container,
.media {
height:100%
}
.media-container .pinnable.pinned,
.media .pinnable.pinned {
opacity:1;
position:fixed;
top:0;
width:100%;
max-width:1260px;
z-index:10;
transition:top .4s ease-in-out
}
.media-container .pinnable.closed,
.media .pinnable.closed {
top:-200px
}
.media-container .pinnable.opened,
.media .pinnable.opened {
top:0
}
.media-container .table-of-contents,
.media .table-of-contents {
overflow-y:auto;
overflow-x:hidden;
width:100%
}
.media-container .table-of-contents.pinned,
.media .table-of-contents.pinned {
max-width:315px;
position:fixed
}
.changed-remotely-alert {
position:fixed;
top:0;
z-index:1031;
width:1260px
}
#contents {
width:100%;
height:100%
}
#contents>div {
height:100%;
overflow-y:hidden
}
#contents.changed-remotely .navbar-fixed-top {
display:none
}
.search .header {
position:relative;
margin-bottom:3rem
}
@media (max-width:767px) {
.search .header>.advanced-search {
 display:block;
 margin-top:1rem
}
}
@media (min-width:768px) {
.search .header>.advanced-search {
 position:absolute;
 top:.5rem;
 right:3rem
}
}
.search .header>.help {
position:absolute;
top:1.2rem;
right:0;
color:#21366b
}
.search .header>.help .fa-question-circle {
font-size:2rem;
color:#78b04a;
vertical-align:text-bottom;
cursor:pointer
}
.search .header>.help .tips {
vertical-align:middle
}
@media screen and (max-width:767px) {
.search .advanced {
 width:90%
}
}
@media (min-width:768px) {
.search .advanced form {
 padding:4.5rem 3rem;
 border-radius:.4rem;
 border:.1rem solid #dcdcdc
}
}
.search .advanced form label {
display:block
}
@media screen and (max-width:767px) {
.search .advanced form button {
 width:100%
}
}
.search .results .filter {
padding:1.5rem;
background-color:#ededed
}
.search .results .filter h2 {
padding-bottom:1rem;
border-bottom:.1rem solid #fff;
font-weight:400
}
.search .results .filter h3 {
color:#000
}
.search .results .filter ul {
list-style-type:none
}
.search .results .filter .filters {
padding:0
}
.search .results .filter .filters>li {
margin:1.5rem 0
}
.search .results .filter .filters dl {
padding-left:1.5rem;
margin:.5rem 0;
width:100%;
display:flex;
flex-wrap:wrap;
justify-content:space-between
}
.search .results .filter .filters dl>dt {
text-align:left;
font-weight:400;
white-space:normal;
flex:1 1 50%
}
.search .results .filter .filters dl>dd {
text-align:right;
margin:0;
flex:1 1 50%
}
.search .results .filter .filters dl .toggle {
margin-top:1rem;
padding-top:.5rem;
border-top:.1rem solid #cdcdcd;
color:#21366b;
cursor:pointer
}
.search .results .filter .filters dl .toggle:hover {
text-decoration:underline
}
.search .results .filter .filters dl .toggle .text {
vertical-align:middle
}
.search .results .filter .filters dl .toggle .text::before {
margin-right:.5rem;
content:"\25b8"
}
.search .results .filter .filters dl .toggle .text.less::before {
content:"\25b4"
}
.search .results .breadcrumbs {
margin-bottom:1.5rem
}
@media (max-width:767px) {
.search .results .breadcrumbs {
 display:none
}
}
.search .results .breadcrumbs .breadcrumb {
position:relative;
display:inline-block;
padding:0;
margin:0 1rem 1rem
}
.search .results .breadcrumbs .breadcrumb:last-child {
margin-right:0
}
.search .results .breadcrumbs .breadcrumb:hover .remove {
opacity:1
}
.search .results .breadcrumbs .breadcrumb .remove {
position:absolute;
top:-1rem;
left:-1rem;
padding:.4rem;
height:2rem;
width:2rem;
border-radius:50%;
font-size:1rem;
line-height:1rem;
text-align:center;
color:#ededed;
background-color:#333;
opacity:0
}
.search .results .breadcrumbs .breadcrumb .remove:hover,
.search .results .breadcrumbs .breadcrumb .remove:focus {
opacity:1
}
.search .results .breadcrumbs .breadcrumb .limit,
.search .results .breadcrumbs .breadcrumb .value {
display:inline-block;
padding:.8rem 1.5rem
}
.search .results .breadcrumbs .breadcrumb .limit {
border-top-left-radius:.4rem;
border-bottom-left-radius:.4rem;
background-color:rgba(243,207,54,.5)
}
@media (max-width:767px) {
.search .results .list .type {
 display:none
}
}
.search .results .list .authors .author {
display:block
}
@media (max-width:767px) {
.search .results .list .edited {
 display:none
}
}
.search .results .list .pagination {
display:table
}
.search .results .list .pagination>ul>li {
display:inline-block
}
.search .results .list .pagination>ul>li.disabled {
display:none
}
.clearfix:before,
.clearfix:after,
.search .results .wrapper:before,
.search .results .wrapper:after {
content:" ";
display:table
}
.clearfix:after,
.search .results .wrapper:after {
clear:both
}
.search .results .wrapper {
margin-left:-15px;
margin-right:-15px
}
.search .results .wrapper .filter {
position:relative;
float:left;
width:25%;
min-height:1px;
padding-left:15px;
padding-right:15px
}
@media (max-width:767px) {
.search .results .wrapper .filter {
 display:none
}
}
.search .results .wrapper .info {
position:relative;
float:left;
width:75%;
min-height:1px;
padding-left:15px;
padding-right:15px
}
@media (max-width:767px) {
.search .results .wrapper .info {
 position:relative;
 float:left;
 width:100%;
 min-height:1px;
 padding-left:15px;
 padding-right:15px
}
}
.search .results .wrapper .info table {
table-layout:fixed;
overflow:hidden
}
.search .results .wrapper .info table tbody {
word-wrap:break-word
}
.search .results>header {
margin-top:1rem
}
.search[aria-busy="true"] .filter {
display:none
}
.search[aria-busy="true"] .info {
float:none!important;
margin:auto auto 6rem
}
.search .advanced {
position:relative;
margin:10px auto;
width:75%
}
@media screen and (max-width:767px) {
.search .advanced {
 width:90%
}
}
.search .advanced h1 {
margin-bottom:30px
}
.search .advanced .help {
position:absolute;
top:1.2rem;
right:0;
color:#21366b
}
.search .advanced .help .fa-question-circle {
font-size:2rem;
color:#78b04a;
vertical-align:text-bottom;
cursor:pointer
}
.search .advanced .help .tips {
vertical-align:middle
}
@media (min-width:768px) {
.search .advanced form {
 padding:45px 30px;
 border-radius:4px;
 border:1px solid #dcdcdc
}
}
.search .advanced form label {
display:block
}
.search .advanced form .form-group:last-child {
margin-bottom:0
}
@media screen and (max-width:767px) {
.search .advanced form button {
 width:100%
}
}
.search .results .list caption {
font-size:2.1rem;
color:#21366b;
text-align:left
}
.search .results .list .advanced-search {
margin-top:20px;
float:right;
z-index:1;
position:relative
}
.search .results .list .table-first {
top:-35px;
position:relative
}
.search .results .list thead .type {
color:#000
}
.search .results .list .type {
width:60px;
text-align:center;
color:#21366b
}
@media (max-width:767px) {
.search .results .list .type {
 display:none
}
}
.search .results .list .authors {
width:165px
}
@media (max-width:767px) {
.search .results .list .authors {
 display:none
}
}
.search .results .list .authors .author {
display:block
}
.search .results .list .edited {
width:115px
}
@media (max-width:767px) {
.search .results .list .edited {
 display:none
}
}
.search .results .list .pagination {
display:table;
margin:5px auto;
text-align:center
}
.search .results .list .pagination>ul {
padding:0;
list-style-type:none
}
.search .results .list .pagination>ul>li {
display:inline-block;
padding:4px;
font-size:1.5rem
}
.search .results .list .pagination>ul>li.disabled {
display:none
}
.search .results .list .pagination>ul>li.active a {
color:#000;
font-weight:700;
pointer-events:none
}
.search .results .list span.comma:last-of-type {
display:none
}
.search {
margin:0 30px
}
.clearfix:before,
.clearfix:after {
display:table
}
.find-content {
display:-webkit-box;
display:-moz-box;
display:-ms-box;
display:-o-box;
display:box;
display:-ms-flexbox;
display:-webkit-flex;
display:-moz-flex;
display:-ms-flex;
display:-o-flex;
display:flex;
-webkit-flex-flow:row nowrap;
-ms-flex-flow:row nowrap;
flex-flow:row nowrap;
-webkit-box-pack:center;
-moz-box-pack:center;
-ms-flex-pack:center;
-webkit-justify-content:center;
-moz-justify-content:center;
-ms-justify-content:center;
-o-justify-content:center;
justify-content:center;
padding:1rem;
color:#dcdcdc;
background-color:#333
}
@media screen and (max-width:767px) {
.find-content {
 display:block
}
}
.find-content>label {
margin:0;
-webkit-flex:1 0 auto;
-moz-flex:1 0 auto;
-ms-flex:1 0 auto;
-o-flex:1 0 auto;
flex:1 0 auto
}
@media screen and (max-width:767px) {
.find-content>label {
 display:block;
 margin-bottom:1.5rem
}
}
.find-content>label>.medium-header {
display:block;
color:#dcdcdc
}
.find-content>label>.medium-header,
.find-content>label>.or {
line-height:3rem;
text-align:center
}
.find-content>.searchbar {
position:relative;
-webkit-flex:4 4 33%;
-moz-flex:4 4 33%;
-ms-flex:4 4 33%;
-o-flex:4 4 33%;
flex:4 4 33%
}
@media screen and (max-width:767px) {
.find-content>.searchbar {
 display:block;
 margin-bottom:1.5rem
}
}
.find-content>.searchbar>.fa-search {
cursor:pointer;
color:#fff;
position:absolute;
left:calc(100% - 35px);
top:.3em;
font-size:130%
}
.find-content>.searchbar>.form-control {
padding:0 3.7rem 0 1.2rem;
background-color:#606163;
font-size:1.2em;
color:#dcdcdc;
height:3rem;
border:.1rem solid transparent;
box-shadow:none
}
.find-content>.searchbar>.form-control::-webkit-input-placeholder {
color:#b6b6b6
}
.find-content>.searchbar>.form-control::-moz-placeholder {
color:#b6b6b6
}
.find-content>.searchbar>.form-control:-ms-input-placeholder {
color:#b6b6b6
}
.find-content>.searchbar>.form-control:focus {
border:.1rem solid transparent;
box-shadow:0 0 3pt 1pt #000
}
.find-content>.or {
-webkit-flex:1 0 auto;
-moz-flex:1 0 auto;
-ms-flex:1 0 auto;
-o-flex:1 0 auto;
flex:1 0 auto;
text-align:center;
margin:0 1.5rem;
font-size:1.4em;
font-weight:200
}
@media screen and (max-width:767px) {
.find-content>.or {
 display:none
}
}
.find-content>.advanced-search {
font-size:1.2em;
padding:.3rem 2.5rem
}
.clearfix:before,
.clearfix:after {
display:table
}
.browse-content {
position:relative;
padding:3rem;
color:#606163
}
.browse-content>h1 {
margin-bottom:2rem
}
.browse-content>.search-categories {
display:flex;
flex-wrap:wrap;
justify-content:space-evenly;
margin-bottom:3rem
}
.browse-content>.search-categories>.search-category {
width:250px;
margin:2rem 3rem
}
.browse-content>.search-categories>.search-category>.medium-header {
width:25rem;
font-weight:300;
margin:0 auto 1.5rem;
text-align:left
}
.browse-content>.search-categories>.search-category>.data {
display:inline-block;
padding:1rem 1.5rem;
width:25rem;
font-weight:300;
text-align:left;
color:#ededed;
background-color:#606163
}
.clearfix:before,
.clearfix:after {
display:table
}
#about .about img {
width:100%;
height:auto
}
.clearfix:before,
.clearfix:after {
display:table
}
.clearfix:before,
.clearfix:after,
#about>.about-wrapper:before,
#about>.about-wrapper:after {
content:" ";
display:table
}
.clearfix:after,
#about>.about-wrapper:after {
clear:both
}
#about {
margin:4rem 2rem
}
#about h1,
#about h2 {
margin-bottom:3rem
}
#about h3,
#about h4 {
margin-bottom:1.5rem
}
#about>.about-wrapper {
margin-left:-15px;
margin-right:-15px
}
#about>.about-wrapper>.about-nav {
position:relative;
min-height:1px;
padding-left:15px;
padding-right:15px
}
@media (min-width:768px) {
#about>.about-wrapper>.about-nav {
 float:left;
 width:25%
}
}
@media screen and (max-width:767px) {
#about>.about-wrapper>.about-nav {
 margin-bottom:3rem
}
}
#about>.about-wrapper>.about-nav li {
background-color:#dcdcdc
}
#about>.about-wrapper>.about-nav li.active {
background-color:#ededed
}
#about>.about-wrapper>.about-nav li a:hover {
background-color:#ededed
}
#about>.about-wrapper>.about-content {
position:relative;
min-height:1px;
padding-left:15px;
padding-right:15px
}
@media (min-width:768px) {
#about>.about-wrapper>.about-content {
 float:left;
 width:75%
}
}
.clearfix:before,
.clearfix:after,
#tos>.tos-wrapper:before,
#tos>.tos-wrapper:after {
content:" ";
display:table
}
.clearfix:after,
#tos>.tos-wrapper:after {
clear:both
}
#tos {
margin:4rem auto;
max-width:960px
}
#tos h1,
#tos h2 {
margin-bottom:3rem
}
#tos h3,
#tos h4 {
margin-bottom:1.5rem
}
#tos>.tos-wrapper {
margin-left:-15px;
margin-right:-15px
}
#tos>.tos-wrapper>.tos-content {
position:relative;
min-height:1px;
padding-left:15px;
padding-right:15px
}
@media (min-width:768px) {
#tos>.tos-wrapper>.tos-content {
 float:left;
 width:100%
}
}
.clearfix:before,
.clearfix:after {
content:" ";
display:table
}
.clearfix:after {
clear:both
}
#license {
margin:4rem auto;
max-width:960px
}
#license h1,
#license h2 {
margin-bottom:3rem
}
#license h3,
#license h4 {
margin-bottom:1.5rem
}

`;
