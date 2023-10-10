//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

mongoose.connect('mongodb+srv://admin-torque:Test-123@cluster0.p60ubwe.mongodb.net/todoList');

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);



const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<--Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List = mongoose.model("List", listSchema);








app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));





app.get("/", function (req, res) {

  Item.find({}).finally(() => {
    console.log("Sucessfull found data from database.");
  }).then((ress) => {

    if (ress.length === 0) {
      Item.insertMany(defaultItems).then((response) => {
        console.log("Sucessfully saved default items to DB. " + response);
        res.redirect("/");
      }).catch((err) => {
        console.log(err);
      });

    } else {
      res.render("list.ejs", {
        listTitle: "Today",
        newItems: ress
      });
    };



  });

});



app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }).finally(() => {
    console.log("Fetch completed.");
  }).then((ress) => {

    if (!ress) {

      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName);

    } else {

      res.render("list.ejs", {
        listTitle: ress.name,
        newItems: ress.items
      });
    };
  });









});






app.post("/", function (req, res) {
  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: newItem
  });

  if (!newItem) {

    if (listName === "Today") {
      res.redirect("/");
    } else {

      res.redirect("/" + listName);

    };





  } else {



    if (listName === "Today") {
      item.save();
      res.redirect("/");

    } else {

      List.find({
        name: listName
      }).finally(() => {
        console.log("Succesfull fetch request.");
      }).then((foundList) => {
        console.log(foundList);
        const foundListtt = foundList[0];
        foundListtt.items.push(item);
        foundListtt.save();

        res.redirect("/" + listName);




      }).catch((err) => {
        console.log(err);
      });

 


    };

  };



});






app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if (listName === "Today") {

    Item.findByIdAndDelete(checkedItemId).finally(() => {
      console.log("Succesfully deleted selected item.");
    }).then((ress) => {

      res.redirect("/");
    }).catch((err) => {
      console.log(err);
    });

  } else {

    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }).finally(() => {
      console.log("Update req succesfull");
    }).then((foundList) => {
      console.log(foundList);
      res.redirect("/" + listName)
    }).catch((err) => {
      console.log(err);
    });






  };

});









app.get("/about", function (req, res) {
  res.render("about");
});




app.listen(3000, function () {
  console.log("Server started on port 3000");
});