//ember app
var LDBB = Ember.Application.create();

//models
LDBB.Bucket = Ember.Object.extend({

});
//kind of class method.
LDBB.Model = Ember.Object.extend();

LDBB.BucketsController = Ember.ArrayController.extend();

LDBB.Model.reopenClass({
    find:function(url,id,type,key){
        console.log('find id: ' + id + ' url: ' + url + ' type: ' + type);
        var collection = Ember.get(type, 'collection');

        if (!collection) {
            collection = Ember.A();
            Ember.set(type, 'collection', collection);
        }

        var foundItem = this.getObjectById(id, type);
        if (!foundItem) {
            foundItem = type.create({id: id});
            $.getJSON(url + "/" + id, function(data) {
                if (data[key]) {
                    console.log(data[key])
                    foundItem.setProperties(data[key]);
                }
            });

            Ember.get(type, 'collection').pushObject(foundItem);
        }


        return foundItem;

    },

    findAll: function(url, type, key) {
        console.log('Model findAll: ' + type);
        var collection = Ember.get(type, 'collection');

        var model = this;

        if (!collection) {
            collection = Ember.A();
            Ember.set(type, 'collection', collection);
        }

        $.getJSON(url, function(data) {

            console.log(data);
            if (data[key]) {
                $.each(data[key], function(i, row) {
                    var item = model.getObjectById(row.id, type)
                    if (!item) {
                        item = type.create({id: row.id});
                        collection.pushObject(item);
                    }

                    item.setProperties(row);
                });
            }
        });

        return Ember.get(type, 'collection');
    },


    getObjectById:function(id,type){
        var  bucket = null;
        var collection  = Ember.get(type,'collection');
        if (!collection){
            var collection = Ember.A();
            Ember.set(type,'collection',collection);
        }
        collection.forEach(function(item){
            if (item.get('id') === id) bucket = item;
        })
        return bucket;
    }
});
LDBB.Bucket = LDBB.Model.extend({
    keys: function() {
        var keys = Ember.A();
        var bucketid = this.get('id');
                    console.log(this.get('key_ids'));
        if (this.get('key_ids')) {
            this.get('key_ids').forEach(function(keyid) {
                console.log('bucketid: ' + bucketid + " keyid: " + keyid);
                keys.pushObject(LDBB.Key.find(bucketid, keyid));
            });
        }

        return keys;
    }.property('key_ids.length')

});
LDBB.Bucket = LDBB.Bucket.reopenClass({
    find:function(id){
        return LDBB.Model.find('/json/buckets',id,LDBB.Bucket,'bucket');
    },
    findAll:function(){
        return LDBB.Model.findAll('/json/buckets',LDBB.Bucket,'buckets');
    }
});

LDBB.Key = LDBB.Model.extend();
LDBB.Key = LDBB.Key.reopenClass({
    find:function(bucketid,id){
        return LDBB.Model.find('/json/buckets/' + bucketid + '/key',id,LDBB.Key,'key');
    },
    findAll:function(bucketid){
        return LDBB.Model.find('/json/buckets/' + bucketid ,LDBB.Key,'bucket');
    }
});

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
    model: function(params) {
        return LDBB.Bucket.find(params.bucket_id);
    }
});



LDBB.BucketKeyRoute = Ember.Route.extend({
    model: function(key) {
        var bucket = this.modelFor('bucket');
        return LDBB.Key.find(bucket.get('id'), key.key_id);
    }
});

