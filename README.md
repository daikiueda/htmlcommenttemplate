# htmlcommenttemplate [![Build Status](https://travis-ci.org/daikiueda/htmlcommenttemplate.svg?branch=master)](https://travis-ci.org/daikiueda/htmlcommenttemplate) [![Coverage Status](https://coveralls.io/repos/daikiueda/htmlcommenttemplate/badge.svg?branch=master)](https://coveralls.io/r/daikiueda/htmlcommenttemplate?branch=master) [![Code Climate](https://codeclimate.com/github/daikiueda/htmlcommenttemplate/badges/gpa.svg)](https://codeclimate.com/github/daikiueda/htmlcommenttemplate)

[![NPM](https://nodei.co/npm/htmlcommenttemplate.png?compact=true)](https://nodei.co/npm/htmlcommenttemplate/)

HTML files updater with Comment format Template Tags.

## Install

```Bash
$ npm install htmlcommenttemplate
```

## Usage

```JavaScript
var htmlcommenttemplate = require( "htmlcommenttemplate" );
htmlcommenttemplate( pathToTemplatesDir )( pathToHTMLFile(s) );
```

__returns__ promise instance object( Q promise - http://documentup.com/kriskowal/q/ )
```JavaScript
var updating = htmlcommenttemplate( pathToTemplatesDir )( pathToHTMLFile(s) );
updating.then( function( result ){
    result.success // []string (path of updated file)
} );
```

## Example

```
├── Templates
│   ├── analytics.tmpl
│   └── base.tmpl
└── htdocs
    ├── index.html
    └── resources
        ├── dummy.css
        ├── dummy.gif
        └── dummy.js
```

### sources

index.html
```HTML
<!doctype html>
<html lang="ja"><!-- InstanceBegin template="/Templates/base.tmpl" -->
    <head>
    </head>
    <body>
            <!-- InstanceBeginEditable name="main" -->
            <h1>/index.html</h1>
            <!-- InstanceEndEditable -->
    </body>
<!-- InstanceEnd --></html>
```

analytics.tmpl
```HTML
<!doctype html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <!-- TemplateBeginEditable name="doc_info" -->
        <title></title>
        <!-- TemplateEndEditable -->
        <!-- TemplateBeginEditable name="head" --><!-- TemplateEndEditable -->
    </head>
    <body>
        <!-- TemplateBeginEditable name="body" --><!-- TemplateEndEditable -->

        <!-- Google Analytics: change UA-XXXXX-X to be your site's ID. -->
        <script>
            (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
            e=o.createElement(i);r=o.getElementsByTagName(i)[0];
            e.src='//www.google-analytics.com/analytics.js';
            r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
            ga('create','UA-XXXXX-X','auto');ga('send','pageview');
        </script>
    </body>
</html>
```

base.tmpl
```HTML
<!DOCTYPE html>
<html lang="ja"><!-- InstanceBegin template="/Templates/analytics.tmpl" -->
    <head>
        <meta charset="UTF-8">
        <!-- InstanceBeginEditable name="doc_info" -->
        <!-- TemplateBeginEditable name="doc_info" -->
        <title>Document</title>
        <meta name="description" content="">
        <meta name="keywords" content="">
        <!-- TemplateEndEditable -->
        <!-- InstanceEndEditable -->
        <!-- InstanceBeginEditable name="head" -->
        <link rel="stylesheet" href="../htdocs/resources/dummy.css">
        <!-- InstanceEndEditable -->
    </head>
    <body>
        <!-- InstanceBeginEditable name="body" -->
        <header>
            common header<br>
            <img src="../htdocs/resources/dummy.gif" height="160" width="320" alt="dummy"><br>
            <a href="../htdocs/index.html">HOME</a>
        </header>
        <main>
            <!-- TemplateBeginEditable name="main" --><!-- TemplateEndEditable -->
        </main>
        <aside>
            <!-- TemplateBeginEditable name="aside" -->
            <a href="../htdocs/index.html">HOME</a>
            <!-- TemplateEndEditable -->
        </aside>
        <footer>common footer</footer>
        <script src="../htdocs/resources/dummy.js"></script>
        <!-- InstanceEndEditable -->
    </body>
<!-- InstanceEnd --></html>
```

### ╭( ･ㅂ･)و ｸﾞｯ !
```Bash
$ node
> require( "htmlcommenttemplate" )( "./Templates" )( "./htdocs/**/*.html" );
```

### result : )
index.html
```HTML
<!doctype html>
<html lang="ja"><!-- InstanceBegin template="/Templates/base.tmpl" -->
    <head>
        <meta charset="utf-8">

        <!-- InstanceBeginEditable name="doc_info" -->
        <title>Document</title>
        <meta name="description" content="">
        <meta name="keywords" content="">
        <!-- InstanceEndEditable -->

        <!-- InstanceBeginEditable name="head" -->
        <link rel="stylesheet" href="resources/dummy.css">
        <!-- InstanceEndEditable -->
    </head>
    <body>

        <header>
            common header<br>
            <img src="resources/dummy.gif" height="160" width="320" alt="dummy"><br>
            <a href="index.html">HOME</a>
        </header>
        <main>
            <!-- InstanceBeginEditable name="main" -->
            <h1>/index.html</h1>
            <!-- InstanceEndEditable -->
        </main>
        <aside>
            <!-- InstanceBeginEditable name="aside" -->
            <a href="index.html">HOME</a>
            <!-- InstanceEndEditable -->
        </aside>
        <footer>common footer</footer>
        <script src="resources/dummy.js"></script>


        <!-- Google Analytics: change UA-XXXXX-X to be your site's ID. -->
        <script>
            (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
            e=o.createElement(i);r=o.getElementsByTagName(i)[0];
            e.src='//www.google-analytics.com/analytics.js';
            r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
            ga('create','UA-XXXXX-X','auto');ga('send','pageview');
        </script>
    </body>
<!-- InstanceEnd --></html>
```
