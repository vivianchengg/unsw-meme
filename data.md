```javascript
// Lists data structures for users and channels
let data = {
  users: [
    {
      uId: 1,
      nameFirst: 'John',
      nameLast: 'Smith',
      email: 'johnsmith@gmail.com',
      handleStr: 'JohnSmith',
      password: 'Britain',
      pId: 1,
      token:['1'],
    }
  ],

  channels: [
    {
      channelId: 1,
      name: 'Channel10',
      isPublic: true,
      allMembers: [1],
      ownerMembers: [1],
      messages: [
        {
          messageId: 1,
          uId: 1,
          message: 'Goodbye world',
          timeSent: 162775623,
          pinned: false 
        }
      ],
      start: 0,
      end: 50,
    }
  ],
}
```

