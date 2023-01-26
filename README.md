# COMP1531 Major Project

**✨ 🥜  UNSW Memes 🥜 ✨**

## Contents

[[_TOC_]]

## 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control, continuous integration, and deployment tooling to sustainably integrate code from multiple parties.

## 1. Overview

UNSW's revenue has been going down, despite the absolutely perfect MyExperience feedback.

Realising the bright potential of its students to recreate existing products they pay for, UNSW has tasked me (Hayden), and my army of COMP1531 students with recreating **<a href="https://www.microsoft.com/en-au/microsoft-teams/group-chat-software">Microsoft Teams</a>**.

The 22T3 cohort of COMP1531 students will build the **backend Javascript server** for a new communication platform, **UNSW Memes** (or just **Memes** for short). We plan to task future COMP6080 students to build the frontend for Memes, something you won't have to worry about.

**UNSW Memes** is the questionably-named communication tool that allows you to share, communicate, and collaborate virtually on a meme-like budget.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

UNSW thanks you for doing your part in saving them approximately $100 per student, per year, despite making you pay for this course. 😊

(For legal reasons, this is a joke).

## 2. Iteration 0: Getting Started

Now complete!

## 3. Iteration 1: Basic Functionality and Tests

Now complete!

## 4. Iteration 2: Building a Web Server

Now complete!

## 5. Iteration 3: Completing the Lifecycle

Now complete!

## 6. Iteration 4: Extending Functionality
In iteration 4, you'll be working alone to implement:
* 2 additional functionalities (in the same format as iteration 3)
* Bonus features of your choice!

Your tutor is not required to provide any assistance with the bonus features section, as it's intended for high-achieving students.

A brief explanation of your additions must be written in a file <code>extra.md</code> that you need to add to your repo.

You will only be style-marked on these additional features (from section 6.2.4) and your custom bonus features in iteration 4, despite using the same repository as the rest of your group. For instructions on how to fork your own version of this repo, see section 6.1.

If you wish to write bonus features that extend upon previous iteration’s functionality that is currently broken in your groups repo, please contact your tutor as assistance and advice will be handled on a case-by-case basis.

Here are some suggestions for extra features.

1. Frontend - **Hangman on Frontend**

    * After a game of Hangman has been started, any user in the channel can type "/guess X" where X is an individual letter. If that letter is contained in the word or phrase they're trying to guess, the app should indicate where it occurs. If it does not occur, more of the hangman is drawn. 
    
    * There is a lot of flexibility in how you achieve this. It can be done only by modifying the backend and relying on messages to communicate the state of the game (e.g. after making a guess, the "Hangman" posts a message with a drawing of the hangman in ASCII/emoji art). Alternatively, you can modify the frontend, if you want to experiment with fancier graphics.

    * The app should use words and phrases from an external source, not just a small handful hardcoded into the app. One suitable source is `/usr/share/dict/words` available on Unix-based systems

    * Note that this part of the specification is deliberately open-ended. You're free to make your own creative choices in exactly how the game should work, as long as the end result is something that could be fairly described as Hangman.

2. Frontend - **Dark Mode** - Modify the frontend code so that on the flip of a switch in the navbar, the website can change to "dark mode" with a colour scheme of your choosing.

3. Frontend - **LaTEX / Markdown Support** - Modify the frontend code so that messages in channels and DMs can be rendered in LaTEX and/or Markdown.

4. **Databases** - Implementing persistence using a form of database via `typeorm`.

7. **New Features** - Implement one or more of the features you have elicited in your Requirements & Design document from iteration 3.

### 6.1 Forking your group's repo
The instructions for forking your group's repo to create your own version are as follows:

1. Navigate to https://gitlab.cse.unsw.edu.au/COMP1531/22T3/groups/<YOUR-GROUP-HERE>/project-backend
2. Click 'Fork' in the top right-corner
3. Name the project <b>project-backend-z5555555<b> using your zID as a replacement. NOTE: it is important to name your repo exactly this for automarking purposes
4. Select your zID as the namespace for the Project URL
5. Leave the Project slug as is
6. Leave the Visibility level as-is (Private)
7. Click 'Fork project'

You now have a personal version of your group's project! The next steps are to share this repo with 1531 staff, so we can mark your work.
1. Go to Project Information > Members (left-hand sidebar of GitLab)
< figure the rest out... >


## 7. Interface specifications

### 7.1. Input/Output types

#### 7.1.1. Iteration 0+ Input/Output Types
<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>email</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>password</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>message</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
</table>

#### 7.1.2. Iteration 1+ Input/Output Types

<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>email</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>named exactly <b>length</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>password</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>message</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
  <tr>
    <td>has prefix <b>time</b></td>
    <td>integer (unix timestamp in seconds), <a href="https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript">[check this out]</a></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>messages</b></td>
    <td>Array of objects, where each object contains types { messageId, uId, message, timeSent }</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>channels</b></td>
    <td>Array of objects, where each object contains types { channelId, name }</td>
  </tr>
  <tr>
    <td>has suffix <b>Str</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>user</b></td>
    <td>Object containing uId, email, nameFirst, nameLast, handleStr</td>
  </tr>
  <tr>
    <td>(outputs only) name ends in <b>members</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>users</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
</table>

#### 7.1.4. Iteration 3+ Input/Output Types

<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>contains substring <b>code</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>Id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has prefix <b>num</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Rate</b></td>
    <td>float between 0 and 1 inclusive</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>userStats</b></td>
    <td> Object of shape {<br />
    &emsp;channelsJoined: [{numChannelsJoined, timeStamp}],<br/>
    &emsp;dmsJoined: [{numDmsJoined, timeStamp}], <br />
    &emsp;messagesSent: [{numMessagesSent, timeStamp}], <br />
    &emsp;involvementRate <br />
    }
    </td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>workspaceStats</b></td>
    <td> Object of shape {<br />
    &emsp;channelsExist: [{numChannelsExist, timeStamp}], <br />
    &emsp;dmsExist: [{numDmsExist, timeStamp}], <br />
    &emsp;messagesExist: [{numMessagesExist, timeStamp}], <br />
    &emsp;utilizationRate <br />
    }
    </td>
  </tr>
  <tr>
    <td>has suffix <b>End</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Url</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) name ends in <b>reacts</b></td>
    <td>Array of objects, where each object contains types { reactId, uIds, isThisUserReacted } where: 
      <ul>
        <li>reactId is the id of a react</li>
        <li>uIds is an array of user id's of people who've reacted for that react</li>
        <li>isThisUserReacted is whether or not the authorised user (user making the request) currently has one of the reacts to this message</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>notifications</b></td>
    <td>Array of objects, where each object contains types { channelId, dmId, notificationMessage } where 
      <ul>
        <li>channelId is the id of the channel that the event happened in, and is <code>-1</code> if it is being sent to a DM</li>
        <li>dmId is the DM that the event happened in, and is <code>-1</code> if it is being sent to a channel</li>
        <li>notificationMessage is a string of the following format for each trigger action:</li>
        <ul>
          <li>tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"</li>
          <li>reacted message: "{User’s handle} reacted to your message in {channel/DM name}"</li>
          <li>added to a channel/DM: "{User’s handle} added you to {channel/DM name}"</li>
        </ul>
      </ul>
    </td>
  </tr>
  <tr>
    <td>(Iteration 3) (outputs only) named exactly <b>user</b></td>
    <td>Object containing uId, email, nameFirst, nameLast, handleStr, profileImgUrl</td>
  </tr>
  <tr>
    <td>(Iteration 3) (outputs only) named exactly <b>messages</b></td>
    <td>Array of objects, where each object contains types { messageId, uId, message, timeSent, reacts, isPinned  }</td>
  </tr>
</table>

### 7.2. Interface
#### 7.2.4. Iteration 4 Interface
All return values should be an object, with keys identically matching the names in the table below, along with their respective values.

**IMPORTANT NOTE**: All of the following routes (except `auth/passwordreset/request` and `auth/passwordreset/reset`) require a `token` in their header. You should raise a `403 Error` when the `token` passed in is invalid.

<table>
  <tr>
    <th>Name & Description</th>
    <th>HTTP Method</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Exceptions</th>
  </tr>
  <tr>
    <td><code>notifications/get/v1</code><br /><br />Returns the user's most recent 20 notifications, ordered from most recent to least recent.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ notifications }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>search/v1</code><br /><br />Given a query substring, returns a collection of messages in all of the channels/DMs that the user has joined that contain the query (case-insensitive). There is no expected order for these messages.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( queryStr )</code><br /><br /><b>Return type if no error:</b><br /><code>{ messages }</code></td>
    <td>
      <b>400 Error</b> when:
      <ul>
        <li>length of <code>queryStr</code> is less than 1 or over 1000 characters</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/share/v1</code><br /><br /><code>ogMessageId</code> is the ID of the original message. <code>channelId</code> is the channel that the message is being shared to, and is <code>-1</code> if it is being sent to a DM. <code>dmId</code> is the DM that the message is being shared to, and is <code>-1</code> if it is being sent to a channel. <code>message</code> is the optional message in addition to the shared message, and will be an empty string <code>''</code> if no message is given.<br /><br />
    A new message containing the contents of both the original message and the optional message should be sent to the channel/DM identified by the <code>channelId</code>/<code>dmId</code>. The format of the new message does not matter as long as both the original and optional message exist as a substring within the new message. Once sent, this new message has no link to the original message, so if the original message is edited/deleted, no change will occur for the new message.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ ogMessageId, message, channelId, dmId }</code><br /><br /><b>Return type if no error:</b><br /><code>{ sharedMessageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>both <code>channelId</code> and <code>dmId</code> are invalid</li>
        <li>neither <code>channelId</code> nor <code>dmId</code> are -1
        <li><code>ogMessageId</code> does not refer to a valid message within a channel/DM that the authorised user has joined</li>
        <li>length of optional <code>message</code> is more than 1000 characters</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>the pair of <code>channelId</code> and <code>dmId</code> are valid (i.e. one is -1, the other is valid) and the authorised user has not joined the channel or DM they are trying to share the message to</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/react/v1</code><br /><br />Given a message within a channel or DM the authorised user is part of, adds a "react" to that particular message.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId, reactId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>messageId</code> is not a valid message within a channel or DM that the authorised user is part of</li>
        <li><code>reactId</code> is not a valid react ID - currently, the only valid react ID the frontend has is 1</li>
        <li>the message already contains a react with ID <code>reactId</code> from the authorised user</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/unreact/v1</code><br /><br />Given a message within a channel or DM the authorised user is part of, removes a "react" to that particular message.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId, reactId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>messageId</code> is not a valid message within a channel or DM that the authorised user is part of</li>
        <li><code>reactId</code> is not a valid react ID</li>
        <li>the message does not contain a react with ID <code>reactId</code> from the authorised user</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/pin/v1</code><br /><br />Given a message within a channel or DM, marks it as "pinned".</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>messageId</code> is not a valid message within a channel or DM that the authorised user is part of</li>
        <li>the message is already pinned</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li><code>messageId</code> refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/unpin/v1</code><br /><br />Given a message within a channel or DM, removes its mark as "pinned".</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>messageId</code> is not a valid message within a channel or DM that the authorised user is part of</li>
        <li>the message is not already pinned</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li><code>messageId</code> refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/sendlater/v1</code><br /><br />Sends a message from the authorised user to the channel specified by <code>channelId</code> automatically at a specified time in the future. The returned <code>messageId</code> will only be considered valid for other actions (editing/deleting/reacting/etc) once it has been sent (i.e. after <code>timeSent</code>).</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, message, timeSent }</code><br /><br /><b>Return type if no error:</b><br /><code>{ messageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
        <li>length of <code>message</code> is less than 1 or over 1000 characters</li>
        <li><code>timeSent</code> is a time in the past</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li><code>channelId</code> is valid and the authorised user is not a member of the channel they are trying to post to</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/sendlaterdm/v1</code><br /><br />Sends a message from the authorised user to the DM specified by <code>dmId</code> automatically at a specified time in the future. The returned <code>messageId</code> will only be considered valid for other actions (editing/deleting/reacting/etc) once it has been sent (i.e. after <code>timeSent</code>). If the DM is removed before the message has sent, the message will not be sent.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ dmId, message, timeSent }</code><br /><br /><b>Return type if no error:</b><br /><code>{ messageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>dmId</code> does not refer to a valid DM</li>
        <li>length of <code>message</code> is less than 1 or over 1000 characters</li>
        <li><code>timeSent</code> is a time in the past</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li><code>dmId</code> is valid and the authorised user is not a member of the DM they are trying to post to</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>standup/start/v1</code><br /><br />For a given channel, starts a standup period lasting <code>length</code> seconds. <br /><br />
    During this standup period, if someone calls <code>standup/send</code> with a message, it will be buffered during the <code>length</code>-second window. Then, at the end of the standup, all buffered messages are packaged into one message, and this packaged message is sent to the channel from the user who started the standup: see section 6.13. for more details. If no standup messages are sent during the standup, no message should be sent at the end.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, length }</code><br /><br /><b>Return type if no error:</b><br /><code>{ timeFinish }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
        <li><code>length</code> is a negative integer</li>
        <li>an active standup is currently running in the channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li><code>channelId</code> is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>standup/active/v1</code><br /><br />For a given channel, returns whether a standup is active in it, and what time the standup finishes. If no standup is active, then <code>timeFinish</code> should be <code>null</code>.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( channelId )</code><br /><br /><b>Return type if no error:</b><br /><code>{ isActive, timeFinish }</code></td>
    <td>
      <b>400 Error</b> when:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li><code>channelId</code> is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>standup/send/v1</code><br /><br />For a given channel, if a standup is currently active in the channel, sends a message to get buffered in the standup queue. Note: @ tags should not be parsed as proper tags (i.e. no notification should be triggered on send, or when the standup finishes)</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, message }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
        <li>length of <code>message</code> is over 1000 characters</li>
        <li>an active standup is not currently running in the channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li><code>channelId</code> is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>auth/passwordreset/request/v1</code><br /><br />Given an email address, if the email address belongs to a registered user, sends them an email containing a secret password reset code. This code, when supplied to <code>auth/passwordreset/reset</code>, shows that the user trying to reset the password is the same user who got sent the email contaning the code. No error should be raised when given an invalid email, as that would pose a security/privacy concern. When a user requests a password reset, they should be logged out of all current sessions.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ email }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      N/A
    </td>
  </tr>
  <tr>
    <td><code>auth/passwordreset/reset/v1</code><br /><br />Given a reset code for a user, sets that user's new password to the password provided. Once a reset code has been used, it is then invalidated.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ resetCode, newPassword }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>resetCode</code> is not a valid reset code</li>
        <li><code>newPassword</code> is less than 6 characters long</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>user/profile/uploadphoto/v1</code><br /><br />Given a URL of an image on the internet, crops the image within bounds (<code>xStart</code>, <code>yStart</code>) and (<code>xEnd</code>, <code>yEnd</code>). Position (0,0) is the top left. Please note: the URL needs to be a non-https URL (it should just have "http://" in the URL). We will only test with non-https URLs.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ imgUrl, xStart, yStart, xEnd, yEnd }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>imgUrl</code> returns an HTTP status other than 200, or any other errors occur when attempting to retrieve the image</li>
        <li>any of <code>xStart</code>, <code>yStart</code>, <code>xEnd</code>, <code>yEnd</code> are not within the dimensions of the image at the URL</li>
        <li><code>xEnd</code> is less than or equal to <code>xStart</code> or <code>yEnd</code> is less than or equal to <code>yStart</code></li>
        <li>image uploaded is not a JPG</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>user/stats/v1</code><br /><br />Fetches the required statistics about this user's use of UNSW Memes.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ userStats }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>users/stats/v1</code><br /><br />Fetches the required statistics about the workspace's use of UNSW Memes.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ workspaceStats }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>admin/user/remove/v1</code><br /><br />Given a user by their <code>uId</code>, removes them from Memes. This means they should be removed from all channels/DMs, and will not be included in the array of <code>users</code> returned by <code>users/all</code>. Memes owners can remove other Memes owners (including the original first owner). Once a user is removed, the contents of the messages they sent will be replaced by 'Removed user'. Their profile must still be retrievable with <code>user/profile</code>, however <code>nameFirst</code> should be 'Removed' and <code>nameLast</code> should be 'user'. The user's email and handle should be reusable.</td>
    <td style="color: red; font-weight: bold;">DELETE</td>
    <td><b>Query Parameters:</b><br /><code>( uId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>uId</code> does not refer to a valid user</li>
        <li><code>uId</code> refers to a user who is the only global owner</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>the authorised user is not a global owner</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>admin/userpermission/change/v1</code><br /><br />Given a user by their <code>uID</code>, sets their permissions to new permissions described by <code>permissionId</code>.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( uId, permissionId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li><code>uId</code> does not refer to a valid user</li>
        <li><code>uId</code> refers to a user who is the only global owner and they are being demoted to a user</li>
        <li><code>permissionId</code> is invalid</li>
        <li>the user already has the permissions level of <code>permissionId</code></li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>the authorised user is not a global owner</li>
      </ul>
    </td>
  </tr>
</table>

### 7.3. Valid email format
To check an email is valid, you may use the following package and function.

```javascript
import validator from 'validator';

validator.isEmail('foo@bar.com');
```
### 7.4. Testing
A common question asked throughout the project is usually "How can I test this?" or "Can I test this?". In any situation, most things can be tested thoroughly. However, some things can only be tested sparsely, and on some other rare occasions, some things can't be tested at all. A challenge of this project is for you to use your discretion to figure out what to test, and how much to test. Often, you can use the functions you've already written to test new functions in a black-box manner.

### 7.5. Pagination
The behaviour in which <code>channelMessages</code> returns data is called **pagination**. It's a commonly used method when it comes to getting theoretially unbounded amounts of data from a server to display on a page in chunks. Most of the timelines you know and love - Facebook, Instagram, LinkedIn - do this.

For example, in iteration 1, if we imagine a user with `authUserId` 12345 is trying to read messages from channel with ID 6, and this channel has 124 messages in it, 3 calls from the client to the server would be made. These calls, and their corresponding return values would be:
 * `channelMessages(12345, 6, 0) => { [messages], 0, 50 }`
 * `channelMessages(12345, 6, 50) => { [messages], 50, 100 }`
 * `channelMessages(12345, 6, 100) => { [messages], 100, -1 }`

### 7.6. Permissions
There are TWO different types of permissions: global permissions and channel/DM-specific permissions. A user's primary permissions are their global permissions. Then the channel/DM permissions are layered on top.

* Global permissions
   1) Owners (permission ID 1), who can also modify other owners' permissions
   2) Members (permission ID 2), who do not have any special permissions
 * Channel/DM permissions
   1) Owners of the channel/DM
   2) Members of the channel/DM

Additional Rules:
* Global permissions
  * All Memes users are global members by default, except for the very first user who signs up, who is a global owner
* Channel permissions
  * A global owner has the same permissions as a channel owner in every channel they're part of. They do not become a channel owner unless explicitly added as one (by a channel owner, or themselves). Hence, if they are removed as a global owner (and are not a channel owner), they will no longer have those channel owner permissions.
* DM permissions
  * A global owner does NOT gain owner permissions in DMs they're part of. The only users with owner permissions in DMs are the original creators of each DM.

### 7.7. User Sessions
Iteration 2 introduces the concept of <b>sessions</b>. With sessions, when a user logs in or registers, they receive a "token" (think of it like a ticket to a concert). These tokens are stored on the web browser (something the frontend handles), and nearly every time that user wants to make a request to the server, they will pass this "token" as part of this request. In this way, the server is able to take this token, look at it (like checking a ticket), and figure out who the user is.

The difference between an <code>authUserId</code> and a <code>token</code> is that an <code>authUserId</code> is a permanent identifier of a user, whereas a new token is generated upon each new login for a user.

A token (to represent a session) for iteration 2 can be as simple a randomly generated number (converted to a string as per the interface specifications) and stored as one of many possible sessions against a specific user.

In this structure, this also means it's possible to "log out" a particular user's session without logging out other sessions. I.e. One user can log in on two different browser tabs, click logout on tab 1, but still functionally use the website on tab 2.

Don't worry about creating a secure method of session storage in iteration 2 - that is for iteration 3.

### 7.8. Working with the frontend
There is a SINGLE repository available for all students at https://gitlab.cse.unsw.edu.au/COMP1531/23T1/project-frontend. You can clone this frontend locally. If you'd like to modify the frontend repo (i.e. teach yourself some frontend), please FORK the repository.

If you run the frontend at the same time as your express server is running on the backend, then you can power the frontend via your backend.

Please note: The frontend may have very slight inconsistencies with expected behaviour outlined in the specification. Our automarkers will be running against your compliance to the specification. The frontend is there for further testing and demonstration.

#### 7.8.1. Example implementation
A working example of the frontend can be used at http://treats-unsw.herokuapp.com/. This is not a gospel implementation that dictates the required behaviour for all possible occurrences. Our implementation will make reasonable assumptions just as yours will, and they might be different, and that's fine. However, you may use this implementation as a guide for how your backend should behave in the case of ambiguities in the spec.

The data is reset occasionally, but you can use this link to play around and get a feel for how the application should behave.

#### 7.8.2. Error raising
Either a `400 (Bad Request)` or `403 (Forbidden)` is thrown when something goes wrong. A `400` error refers to issues with user input, whereas a `403` error refers to issues with authorisation. All of these cases are listed in the **Interface** table. If input implies that both errors should be thrown, throw a `403` error.

One exception is that even though it's not listed in the table, for all routes (except `auth/register`, `auth/login`, `auth/passwordreset/request` and `auth/passwordreset/reset`), a `403` error is thrown when the token passed in is invalid.

For errors to be appropriately raised on the frontend, they must be thrown as follows:

```javascript
if (true) { // condition here
    throw HTTPError(403, "description")
}
```

The quality of the descriptions will not be assessed, but you must modify your errors to this format.

There has also been a middleware handler added to your `server.ts` file to take care of errors encountered. The `middleware-http-errors`[https://www.npmjs.com/package/middleware-http-errors] package is custom-made for COMP1531 students, used as follows:

```javascript
app.use(errorHandler());
```

### 7.9. Secure Sessions & Passwords
Passwords must be stored in an **encrypted** form.

You must **hash** tokens in iteration 3, and pass them through a custom `token` HTTP Header (rather than passing them plainly as `GET/DELETE` parameters).

In this model, you will replace `token` query and body parameters with a `token` HTTP header when dealing with requests/routes only. You shouldn't remove `token` parameters from backend functions, as they must perform the validity checks.

You can access HTTP headers like so:
```javascript
const token = req.header('token');
```

A sample flow logging a user in might be as follows (other flows exist too):
1. Client makes a valid `auth/login` call
2. Server generates `token` and `hashOf(token+secret)`
3. Server returns the hash as the `token` value in the response's body.

A sample flow creating a channel might be as follows:
1. Client makes a valid `channel/create` call
2. Server gets `token` hash in th request's HTTP header
3. Server passes `token` hash to the relevant backend function to compare to the stored `token`, determining if it's a valid session.

**Why hash tokens?**
If we hash tokens (combined with a global secret) before storing them, and an attacker gets access to our backend of active sessions (i.e. our list of valid tokens), they won't be able to determine the client-side token (as they don't know the hash function or secret added to the token). 

**Why pass tokens as a HTTP header?**
Any query parameters (those used by `GET/DELETE` functions) can be read in plaintext by an eavesdropper spying on your HTTP requests. Hence, by passing an authentication token as a query parameter, we're allowing an attacker to intercept our request, steal our token and impersonate other users! On the other hand, HTTP headers are encrypted (as long as you use HTTPS protocol), meaning an eavesdropper won't be able to read token values.

While this safely protects sessions from server-side attacks (accessing our persistent data) and man-in-the-middle attacks (intercepting our HTTP requests), it doesn't protect against client-side attacks (stealing a token on the client-side, after the HTTP header has been decoded and received by the user). 

**You do not need to worry about mitigating client-side attacks**, but you can read more about industry-standard session management <a href="https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#secure-attribute">here</a>.


### 7.10. Notifications and tagging users
#### 7.10.1 Notifications
If an action triggering a notification has been 'undone' (e.g. a message has been unreacted, or a tagged message has been edited/removed), the original notification should not be affected and will remain.

A user should not be notified of any reactions to their messages if they are no longer in the channel/DM that the message was sent in.

A user should be notified if they tag themselves in a message.

#### 7.10.2 Tagging
A user is tagged when a message contains the @ symbol, followed immediately by the user’s handle. The end of the handle is signified by the end of the message, or a non-alphanumeric character. The message '`hi@handle`' contains a valid tag. '`@handle1@handle2 hello!`' contains two valid tags.

Some additional requirements are:
* If the handle is invalid, or the user is not a member of the channel or DM, no one is tagged.
* A user should be able to tag themselves.
* A message can contain multiple tags.
* If the same valid tag appears multiple times in one message, the user is only notified once.

Tagging should also occur when messages are edited to contain tags and when the message/share optional message contains tags.

There is no requirement to have tags notify users inside a standup or when the buffered standup messages are sent.

### 7.11. Analytics
COMP6080 students have implemented analytics pages for users and for the Memes workspace on the frontend, and now these pages need data. Your task is to add backend functionality that keeps track of these metrics:

For users:
  * The number of channels the user is a part of
  * The number of DMs the user is a part of
  * The number of messages the user has sent
  * The user's involvement, as defined by this pseudocode: `sum(numChannelsJoined, numDmsJoined, numMsgsSent)/sum(numChannels, numDms, numMsgs)`. If the denominator is 0, involvement should be 0. If the involvement is greater than 1, it should be capped at 1.

For the Memes workspace:
  * The number of channels that exist currently
  * The number of DMs that exist currently
  * The number of messages that exist currently
  * The workspace's utilization, which is a ratio of the number of users who have joined at least one channel/DM to the current total number of users, as defined by this pseudocode: `numUsersWhoHaveJoinedAtLeastOneChannelOrDm / numUsers`

As UNSW is very interested in its users' engagement, the analytics must be **time-series data**. This means every change to the above metrics (excluding `involvementRate` and `utilizationRate`) must be timestamped, rather than just the most recent change. For users, the first data point should be 0 for all metrics at the time that their account was created. Similarly, for the workspace, the first data point should be 0 for all metrics at the time that the first user registers. The first element in each array should be the first metric. The latest metric should be the last element in the array.

For users, the number of channels and DMs that they are a part of can increase and decrease over time, however the number of messages sent will only increase (the removal of messages does not affect it).

For the workspace, `numMsgs` is the number of messages that exist at the current time, and should decrease when messages are removed, or when `dm/remove` is called. Messages which have not been sent yet with `message/sendlater` or `message/sendlaterdm` are not included, and `standup/send` messages only count when the final packaged standup message from `standup/start` has been sent. `numChannels` will never decrease as there is no way to remove channels, and `numDms` will only decrease when `dm/remove` is called.

In addition to keeping track of these metrics, you are required to implement two new endpoints, `user/stats` and `users/stats`.

### 7.12. Reacts
The only React ID currently associated with the frontend is React ID 1, which is a thumbs up :thumbsup:. You are welcome to add more (this will require some frontend work).

### 7.13. Standups
Once a standup is finished, all of the messages sent to `standup/send` are packaged together in *one single message* posted by *the user who started the standup*. This packaged message is sent as a message to the channel where the standup was started, timestamped at the moment the standup finished.

The structure of the packaged message is like this:

```txt
[messageSender1Handle]: [message1]
[messageSender2Handle]: [message2]
[messageSender3Handle]: [message3]
[messageSender4Handle]: [message4]
```

For example:

```txt
hayden: I ate a catfish
giuliana: I went to kmart
rani: I ate a toaster
tam: my catfish ate a kmart toaster
```

Standups can be started on the frontend by typing "/standup X" (where X is the number of seconds that the standup lasts for) into the message input and clicking send. E.g., to start a 90-second standup, type "/standup 90" and press send.

You will not be tested on any behaviour involving the user who started a standup being removed from the channel or Memes while the standup is ongoing, therefore you can decide this behaviour yourself.

### 7.14. profileImgUrl & image uploads
For outputs with data pertaining to a user, a `profileImgUrl` must be present. When images are uploaded for a user profile, after processing them you should store them on the server such that your server now locally has a copy of the cropped image of the original file linked. Then, the `profileImgUrl` should be a URL to the server, such as http://localhost:5001/imgurl/adfnajnerkn23k4234.jpg (a unique url you generate).

For any given user, if they have yet to upload an image, there should be a site-wide default image used.

Note: This is most likely the most challenging part of the project, so don't get lost in this. We would strongly recommend most teams complete this capability *last*.

## 8. Due Dates and Weightings

|Iteration|Due date                              |Demonstration to tutor(s)      |Assessment weighting of project (%)|
|---------|--------------------------------------|-------------------------------|-----------------------------------|
|   0     |10pm Friday 24th February (**week 2**)    |No demonstration               |5%                                 |
|   1     |10pm Friday 10th March  (**week 4**)   |In YOUR **week 5** laboratory  |20%                                |
|   2     |10pm Friday 31st March (**week 7**)    |In YOUR **week 8** laboratory  |30%                                |
|   3     |10pm Monday 17th April (**week 10**)  |No demonstration               |30%                               |
|   3     |10pm Friday 28th April (**week 11**)  |No demonstration               |15%                              |

### 8.1. Submission & Late Penalties

There is no late penalty, as we do not accept late submissions. You will be assessed on the most recent version of your work at the due date and time.

To submit your work, open up a CSE terminal and run:

` $ 1531 submit [iteration] [groupname]`

For example:

` $ 1531 submit iteration1 W11A_EGGS`

Only one person per group needs to run this command. This will submit a copy of your latest git commit to our systems for automarking. 

NOTE: Our automarking will be run on your master branch at the time of submission, the `1531 submit` command is for record-keeping purposes only.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but `master` should only contain working code.

Minor isolated fixes are not allowed for iteration 4.

If you want to have your automarking re-run:  
* create a branch, e.g. `iter1-fix`, based off the submission commit  
* make the minimal number of necessary changes (i.e. only fix the trivial bugs that cost you many automarks)  
* push the changes to GitLab  
* share the name of the branch with your tutor

## 9. Individual Contribution
While we do award a tentative mark to your group as a whole, your actual mark for each iteration is given to you individually. Your individual mark is determined by your tutor, with your group mark as a reference point. Your tutor will look at the following items each iteration to determine your mark:
 * Project check-in
 * Code contribution
 * Tutorial contributions
 * Peer assessment

In general, all team members will receive the same mark (a sum of the marks for each iteration), **but if you as an individual fail to meet these criteria, your final project mark may be scaled down**, most likely quite significantly.

Iteration 4 is marked individually, and added onto your individually-scaled group project mark.

### 9.1. Project check-in
There is no group check-in for iteration 4.

### 9.2. Tutorial contributions
From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials
* Participate in tutorials by asking questions and offering answers
* [online only] Have your web cam on for the duration of the tutorial and lab

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 9.3. Documentation contribution
In terms of code documentation, your functions such as `authRegister`, `channelInvite`, `userProfile`, etc. are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  * 
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

## 10. Automarking & Leaderboard
### 10.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 2.5 minute timer on the running of your tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 2.5 minutes to run on the pipeline, you don't have to worry about it potentially taking longer when we run automarking.

### 10.2. Leaderboard
There will be no leaderboard in iteration 4.

## 11. Plagiarism

The work you and your group submit must be your own work. Submission of work partially or completely derived from any other person or jointly written with any other person is not permitted. The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Relevant scholarship authorities will be informed if students holding scholarships are involved in an incident of plagiarism or other misconduct.

Do not provide or show your project work to any other person, except for your group and the teaching staff of COMP1531. If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

Note: you will not be penalized if your work has the potential to be taken without your consent or knowledge.
