
const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const app = express();
const _ = require("lodash");


app.use(express.static("public"));   //used to access css 

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://admin-vivek:vyvivek2003@cluster0.qgfju0g.mongodb.net/todolistDB", { useNewUrlParser: true });



const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your Todolist"
})
const item2 = new Item({
    name: "Type and then Click + to add"
})
const item3 = new Item({
    name: "Tick the checkbox to Delete"
})

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]               //In this we are storing the default items object
});

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully Saved values");
                }
                
            });
            res.redirect("/");    //Redirecting to home route bcz we need to render values after insertion
        }
        else {
            res.render("list", { listTitle: "Today", yourinput: foundItems });
        }



    });


});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    if (customListName === "About") {
        res.render("about");
    } 
    else 
    {
        List.findOne({ name: customListName }, function (err, foundList) {
        
            if (!err ) {
                if (!foundList) {
                //create a new list if don't exist 
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                // Shows the existing list
                res.render("list", { listTitle: foundList.name, yourinput: foundList.items });
            }
            }
        });
    }
});


// POST method for adding data in todolist
app.post("/", function (req, res) {
    const itemName = req.body.newItem;

    const listName = req.body.list;    // custom listName

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/"); // to show the data on todolist instantly after adding
    }
    else {
        // adding data to customList
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});



// POST method for deleting elements

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;

    const listName = req.body.listName;//CustomList title name  

    if (listName === "Today") {
        Item.deleteOne({ "_id": checkedItemId }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully Deleted item");
                res.redirect("/");
            }

        });
    }
    else{
        List.findOneAndUpdate(                        //  <ModelName>.find0neAndUpdate(
            {name:listName},                          //    {conditions},
            {$pull:{items:{_id:checkedItemId}}},      //    {$pull: {field: {_id: value}}},
            function (err,foundList) {                //    function (err, results){  
                                                         // }); 
            if (!err) {
                res.redirect("/"+listName);
            }    
                
            });
    }

});





app.listen(3000, function (req, res) {
    console.log("Server running on port 3000");
});

