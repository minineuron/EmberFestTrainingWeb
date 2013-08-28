//ember app
var LDBB = Ember.Application.create();

//models
LDBB.Bucket = Ember.Object.extend({

});
//kind of class method.
LDBB.Bucket.reopenClass({
    collection: Ember.A(

    ),
    find:function(id){
        var foundItem = null;
        foundItem = this.getObjectById(id);
        return foundItem;
    },
    findAll:function(){
        var collection  = Ember.get(LDBB.Bucket,'collection');
        collection.pushObject(LDBB.Bucket.create({'id':'One', "key_ids":["Key One","Key Two"]}));
        collection.pushObject(LDBB.Bucket.create({'id':'Two', "key_ids":["Key Three","Key Four"]}));

        return collection;

    },
    getObjectById:function(id){
        var  bucket = null;
        Ember.get(LDBB.Bucket,'collection').forEach(function(item){
            if (item.get('id') === id) bucket = item;
        })
        return bucket;
    }
})



//ember router
LDBB.Router.map(function() {
	this.resource("buckets", {path: "/"}, function() {
		this.resource("bucket", {path: "/bucket/:bucket_id"}, function() {
			this.route("key", {path: "/key/:key_id"}); });
	});	
});

//LDDB routes
LDBB.BucketsRoute = Ember.Route.extend({
    model: function() {
        return LDBB.Bucket.findAll();
    }
});

LDBB.BucketRoute = Ember.Route.extend({
    model: function(bucket) {
        console.log(bucket)
        return LDBB.Bucket.find(bucket.bucket_id);
    }
});



LDBB.BucketKeyRoute = Ember.Route.extend({
    model: function(key) {
        var bucket = this.modelFor('bucket');
        return LDBB.Key.find(bucket.get('id'), key.key_id);
    }
});

