Assumptions made in Iteration 1:
- Incrementing method for uId must be kept between -MAX_VALUE and MAX_VALUE to prevent two uIds of infinity or negative infinity
- Incrementing method for channelId must be kept between -MAX_VALUE and MAX_VALUE to prevent two uIds of infinity or negative infinity
- When given string, it will be in ASCII characters
- For channelMessagesV1, the 'start' parameter will never be negative
- For channelInviteV1, invited users will be added to the allMembers array of the channel by default