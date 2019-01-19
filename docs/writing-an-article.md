# journal - writing an article

An article file is composed of two sections:
 - meta data
 - article content

## Meta Data

This contains data about the blog as a key-value dictionary.

```
---

title: The Title of My Blog
author: Luke

...

---

...

```

Please see the example below. Changes are currently likely as journal evolves.

## Article Content

Article content can be any valid [GitHub-Flavoured Markdown](https://guides.github.com/features/mastering-markdown/). HTML is not rendered.

## Example Article

Here is an example article file:

```

---

title: The Original Example Blog
author: Luke Barnard
authorTagline: Examples are the only way to learn
imageUrl: /static/image3-small.jpeg
authorImg: /static/avatar.png

---

### How about a subtitle?

Amazing, I just inserted a header and this is another paragraph. This paragraph might be longer than the previous one, but I'm just typing it out to make it look authentic. There's a limit to how much I can be bothered to type so much text so I might start repeating myself. There's a limit to how much I can be bothered to type so much text so I might start repeating myself.

 1. Some point
 2. Another, longer point, which is much much longer, more than I can be bothered really. If your points are this long, you might as well start a new paragraph about the thing you want to talk about.
 3. The final point

This has some bullet points:
 - This one
 - another bullet
 - finally this one


Now for some code:
```js
const test = 'test';

function hello() {
    console.info('i am a function. you called?');
}
```

See, I told you. There's a limit to how much I can be bothered to type so much text so I might start repeating myself. There's a limit to how much I can be bothered to type so much text so I might start repeating myself. There's a limit to how much I can be bothered to type so much text so I might start repeating myself. There's a limit to how much I can be bothered to type so much text so I might start repeating myself.

[Look, a link](/some/otherblog) that will get you nowhere. Oh well, it's still a link.

## Another header
That header looked smaller, but I'm not sure.

![](/static/image3-small.jpeg)

-----

Above is a horizontal line. Use with caution: very thin.

...

```

