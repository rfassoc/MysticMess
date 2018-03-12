# Mystic Mess Script Syntax
Mystic Mess uses a **custom script syntax** to describe the interactions between the chatroom members. It's essentially an extended version of a classical chatroom script.

A script consists of two distinct sections: the header and the body. The header section is where the script defines various bits of metadata describing how the script should work while the body is where the actual chatroom interactions occur. For instance, consider the following example script:
```yml
video: COlXAgQ6Cu0
members: zen, seven
---
zen: hi, seven!
seven: hi, zen!
```
In this case, we define two metadata (`video` and `members`) then define two chat messages. Note how the header and body are separated by `---`.

Next, let's take a look at each of the two sections in more detail.

## Script Header
The metadata defined in the header consists of key-value pairs separated by a colon. The accepted metadata is as follows:

Metadata | Expected Value | Example | Function
-- | -- | -- | --
`mc.name` | `<name>` | `Eve` | The name of the main character in the script.
`mc.colour` | `<hex>` | `2196f3` | The colour of the main character's chat bubbles.
`mc.avatar` | `<url>` | `https://i.imgur.com/XXsbtQM.png` | The avatar used by the main character.
`video` | `<videoId>` | `COlXAgQ6Cu0` | The YouTube video ID to play music from.
`members` | `<name>[,<name>,...]` | `jumin, jaehee` | The initial members in the chatroom.
`background` | `<background>` | `dusk` | The chatroom background to use.

An example of a header using all the metadata might be as follows:
```yml
mc.name: Eve
mc.colour: 2196f3
mc.avatar: https://i.imgur.com/XXsbtQM.png
video: COlXAgQ6Cu0
members: jumin, jaehee
background: dusk
```

Technically, it's not absolutely necessary to include a header, but it's always recommended that you use at least a `members` metadatum to ensure the member maintains consistency throughout the script's execution.

## Script Body
The body of the script is similar to an augmented chatroom syntax. It's a superset of Tumblr's chat syntax, so theoretically any Tumblr chat post should be a valid script body. For example, the following is a perfectly good script body:
```yml
yoosung: i like milk
seven: especially chocolate milk?
yoosung: that's mean
```
However, this script body doesn't take advantage of all the fancy features exposed by Mystic Mess! Let's take a closer look at the formation of a script.

### Lines
A "line" refers to a single action performed by some character in a script. These actions range from sending a chat message to showing a heart to posting an animated emote. In general, a line contains the name of the character performing the action as well as symbols and additional metadata describing the action.

#### Chat Line
Chat lines are the most basic components of a script. They represent some character sending a chat message and are formatted as follows:
```
<character>[|<flags>]:<message>
```
The `flags` parameter is a set of characters that describe how the chat message should be displayed. Available flags are delineated below:

Flag | Effect
-- | --
`c` | Makes text that curly font.
`s` | Makes text that sans-serif font.
`w` | Makes text that weird font.
`b` | Makes text bold.
`h` | Makes text huge.
`u` | Underlines text.
`!` | Causes the chatroom to shake.

Compatible flags can be composed to format a chat message. For example, suppose I want Yoosung to send a bold and huge message in sans-serif that shakes the chatroom. It might look like this:
```yml
yoosung: i like milk
seven: especially chocolate milk?
yoosung|bhs!: that's mean
```
Note that the flags section is strictly optional, but it certainly does make the chatroom look fancier.

Another useful feature of chat lines is that the phrase `MC` will be automagically replaced with the name of your MC as configured in your header.

#### Join/Leave Lines
Join and leave lines describe a character entering or leaving the chatroom. They're formatted as follows:
```
+<character>
-<character>
```
The line prefixed with `+` represents somebody entering and the line prefixed with `-` represents somebody leaving. For example, suppose I want Yoosung to storm out of the room in rage. It might look like this:
```yml
yoosung: i like milk
seven: especially chocolate milk?
yoosung: that's mean
-yoosung
```

#### Emote Line
Emote lines represent a character sending an animated emote. They're formatted as follows:
```
<character>!<emote>
```
For example, suppose I want Yoosung to send a crying emote. It might look like this:
```yml
yoosung: i like milk
seven: especially chocolate milk? 
yoosung: that's mean
yoosung!cry
```
The available emotes for each character are enumerated at the bottom of the [main documentation file](https://github.com/rfassoc/MysticMess/blob/master/docs/documentation.md).

#### Image Line
An image line represents a character sending an image. They're formatted as follows:
```
<character>&<url>
```
The provided URL must be a direct link to some image file. For example, suppose I want Seven to send [an image of chocolate milk](https://i.imgur.com/OKeniXw.png). It might look like this:
```yml
yoosung: i like milk
seven&https://i.imgur.com/OKeniXw.png
yoosung: that's mean
```

#### Heart Line
A heart line represents a character granting a heart and displays the "flying heart" animation in the appropriate colour upon execution. They're formatted as follows:
```
<character> <3
```
Note that heart lines should always be placed *after* the line that triggers the heart. For example, suppose I want a Yoosung heart to appear when he sends his second message. It might look like this:
```yml
yoosung: i like milk
seven: especially chocolate milk?
yoosung: that's mean
yoosung <3
```

### Branches
Script bodies are organized into "blocks", which are just contiguous and nest-able sections of lines. In fact, the entire script body is just a single huge block which may or may not have more blocks nested within it.

When a script branches, it means the player is prompted to select a response from a finite set and the direction the chatroom continues from there is dependent on their response. A branching segment is formatted as follows:
```
^
<response>
 <block>
[<response>
 <block>...]
$
```
When a response is selected, the associated block is executed and all the other blocks are ignored. For instance, consider the following example where the player is given a choice between two reponses:
```yml
^
hi, yoosung!
 yoosung: hi!
 yoosung <3
hi, seven!
 seven: heyo!
 seven <3
$
```
If the player selects "hi, yoosung!", this script block is executed:
```yml
yoosung: hi!
yoosung <3
```
... and if the player selects "hi, seven!", this script block is executed:
```yml
seven: heyo!
seven <3
```
Note how the nested blocks are indented by one space; this is how the scripting engine determines where the block begins and ends.

Branching segments can also be nested to a theoretically indefinite depth:
```yml
^
hi, yoosung!
 yoosung: hi! what's your favourite letter?
 ^
 the letter f
  yoosung: that's a weird letter...
 the letter y
  yoosung: hey, that's my favourite too!
 $
hi, seven!
 seven: heyo! what's your favourite number?
 ^
 two
  seven: wow! that's the numeral base for binary!
 seven hundred seven
  seven: you have great taste!
 $
$
```
Branching segments can also theoretically have an infinite number of choices, but it's recommended that this be limited to at most five.

## Example Scripts
Some example scripts are available at [this Gist](https://gist.github.com/phantamanta44/694c23acb6d4e8cb62120e0e9c7c906c/).