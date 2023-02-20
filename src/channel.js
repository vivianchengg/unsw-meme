// Function that lists details of members in the channel

function channelDetailsV1 (authUserId, channelId) {
    return {
        name: 'Hayden',
        ownerMembers: [
            {
            uId: 1,
            email: 'example@gmail.com',
            nameFirst: 'Hayden',
            nameLast: 'Jacobs',
            handleStr: 'haydenjacobs',
            }
        ],
        allMembers: [
            {
            uId: 1,
            email: 'example@gmail.com',
            nameFirst: 'Hayden',
            nameLast: 'Jacobs',
            handleStr: 'haydenjacobs',
            }
        ],
    }
}