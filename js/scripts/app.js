//ember app
var LDBB = Ember.Application.create();

//models
LDBB.Bucket = Ember.Object.extend({

});
//kind of class method.
LDBB.Model = Ember.Object.extend();

LDBB.BucketsController = Ember.ArrayController.extend({
    addBucket:function(){
        var name = this.get('newBucketName');
        var model = LDBB.Bucket.create({'id':name});
        LDBB.Bucket.createRecord(model);
    }
});


LDBB.BucketController = Ember.ObjectController.extend({
    addKey:function(){
        var name = this.get('newKeyName');
        //var model = this.get('content');
        //debugger;
        var model = LDBB.Key.create({'id':this.get('content.id')+name,"bucketName":this.get('content.id'),"keyName":name,"value":""});
        console.log(model);
        LDBB.Key.createRecord(model);
        var bucket = LDBB.Bucket.find(this.get('content.id'));
        bucket.get('key_ids').pushObject(name);
    },
    deleteBucket:function(){
        var model = this.get('content');
        LDBB.Bucket.deleteRecord(model);
    }
})


LDBB.BucketKeyController = Ember.ObjectController.extend({
    isEditing:false,
    doSave:function(){
        console.log('saving');
        this.set('isEditing',false);
        var model = this.get('content');
        LDBB.Key.updateRecord(model);

    },
    doEdit:function(){
        this.set('isEditing',true);
    },
    modelObserver:function(){
        this.set('isEditing',false);
    }.observes('content')

})

LDBB.Model.reopenClass({
    find:function(url,id,type,key){
        //console.log('find id: ' + id + ' url: ' + url + ' type: ' + type);
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

                    foundItem.setProperties(data[key]);
                }
            });

            Ember.get(type, 'collection').pushObject(foundItem);
        }


        return foundItem;

    },

    findAll: function(url, type, key) {
        //console.log('Model findAll: ' + type);
        var collection = Ember.get(type, 'collection');

        var model = this;

        if (!collection) {
            collection = Ember.A();
            Ember.set(type, 'collection', collection);
        }

        $.getJSON(url, function(data) {


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
    updateRecord: function(url, type, model) {
        //console.log('update: ' + type + " " + model.get('id'));

        model.set('isSaving', true);

        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(model),
            success: function(res, status, xhr) {
                if (res.id) {
                    model.set('isSaving', false);
                    model.setProperties(res);
                } else {
                    model.set('isError', true);
                }
            },
            error: function(xhr, status, err) { model.set('isError', false);  }
        });
    },
    createRecord: function(url, type, model) {
        console.log('create: ' + type + " " + model.get('id'));
        //var model = this;

        var collection = Ember.get(type, 'collection');



        if (!collection) {
            collection = Ember.A();
            Ember.set(type, 'collection', collection);
        }

        model.set('isSaving', true);
        console.log(JSON.stringify(model));
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(model),
            success: function(res, status, xhr) {
                if (res.id) {
                    model.set('isSaving', false);
                    model.setProperties(res);
                    collection.pushObject(model);
                } else {
                    model.set('isError', true);
                }
            },
            error: function(xhr, status, err) { model.set('isError', false);  }
        });
    },
    deleteRecord: function(url, type, model) {
        //console.log('delete: ' + type + " " + model.get('id'));
        //var model = this;

        var collection = Ember.get(type, 'collection');



        if (!collection) {
            collection = Ember.A();
            Ember.set(type, 'collection', collection);
        }

        model.set('isSaving', true);

        $.ajax({
            type: "DEL",
            url: url,
            data: JSON.stringify(model),
            success: function(res, status, xhr) {
                if (res.id) {
                    model.set('isSaving', false);
                    model.setProperties(res);
                    collection.removeObject(model);
                } else {
                    model.set('isError', true);
                }
            },
            error: function(xhr, status, err) { model.set('isError', false);  }
        });
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
    },
    createRecord: function(model) {
        LDBB.Model.createRecord("/json/buckets/", LDBB.Bucket,model);
    },
    deleteRecord: function(model) {
        LDBB.Model.deleteRecord("/json/buckets/", LDBB.Bucket,model);
    }
});

LDBB.Key = LDBB.Model.extend();
LDBB.Key = LDBB.Key.reopenClass({
    find:function(bucketid,id){
        return LDBB.Model.find('/json/buckets/' + bucketid + '/key',id,LDBB.Key,'key');
    },
    findAll:function(bucketid){
        return LDBB.Model.find('/json/buckets/' + bucketid ,LDBB.Key,'bucket');
    },
    updateRecord: function(model) {
        LDBB.Model.updateRecord("/json/buckets/" + model.get('bucketName') + "/key/" + model.get('keyName'), LDBB.Key, model);
    },
    createRecord: function(model) {
        LDBB.Model.createRecord("/json/buckets/" + model.get('bucketName') + "/key/", LDBB.Key,model);
    },
    deleteRecord: function(model) {
        //???? url is unkown
        LDBB.Model.deleteRecord("/json/buckets/", LDBB.Key,model);
    }

});

//ember router
LDBB.Router.map(function() {
	this.resource("buckets", {path: "/"}, function() {
		this.resource("bucket", {path: "/bucket/:bucket_id"}, function() {
			this.route("key", {path: "/key/:key_id"}); });
            //this.route("edit", {path: "/edit/:key_id"}); });
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

