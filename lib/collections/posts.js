Posts = new Mongo.Collection('posts');

Posts.allow({
  remove: function(userId, post) { return ownsDocument(userId, post); },
});

Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id, 
      author: user.username, 
      submitted: new Date()
    });
    var postId = Posts.insert(post);
    return {
      _id: postId
    };
  }, 
  postEdit: function(postAttributes, postId) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });
    check(_.without(_.keys(postAttributes), 'url', 'title').length, 0);

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    Posts.update(postId, {$set: postAttributes}, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      }
    });
    
    return {
  		_id: postId
	};
  }
});