const express = require("express")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

app.use(express.urlencoded({ extended: true }))

app.set("view engine", "ejs")

app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-karanveer:Test%40123@cluster0.tbjqc5e.mongodb.net/", {
    dbName: "todoListDb"
}, (err)=>{
    if (err) {
        console.log(err);
    } else {
        console.log('successfully connected to mongoDb');
    }
})

const itemsSchema = new mongoose.Schema({
    name: String
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const Item = new mongoose.model("Item", itemsSchema)

const List = new mongoose.model("List", listSchema)

const item1 = new Item({
    name: "Task 1"
})

const item2 = new Item({
    name: "Task 2"
})

const item3 = new Item({
    name: "Task 3"
})

const defaultItems = [item1, item2, item3]

app.get("/", (req,res) => {
    Item.find({}, (err, foundItems)=>{
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems,(err)=>{
                if(err) {
                    console.log(err);
                } else {
                    console.log('successfully added');
                    res.redirect('/')
                }
            })
        } else {
            if (err) {
                console.log(err);
            } else {
                res.render('index', {title: 'Today', itemList: foundItems})
            }
        }
    })
})

app.get("/:customListName", (req,res)=>{
    const listName = _.capitalize(req.params.customListName);
    if(listName === 'favicon.ico')  return
    List.findOne({name: listName}, (err,foundList)=>{
        if (!err) {
            if(!foundList) {
                const list = new List({
                    name: listName,
                    items: defaultItems
                })
                list.save()
                res.render('index', {title: listName, itemList: defaultItems})
            } else {
                res.render('index', {title: foundList.name, itemList: foundList.items})
            }
        }
    })
})

app.post("/", async(req,res) => {
    const item = req.body.newItem
    const list = req.body.list
    const itemObj = new Item({
        name: item
    })
    if (list === 'Today') {
        itemObj.save()
        res.redirect('/')
    } else {
        const listObj = await List.findOne({name: list})
        listObj.items.push(itemObj)
        listObj.save()
        res.redirect('/' + list)
    }
})

app.post("/delete", async(req,res) => {
    const itemToDelete = req.body.item
    const list = req.body.list
    if (list === "Today") {
        Item.findByIdAndRemove(itemToDelete, (err)=>{
            if(err) {
                console.log(err);
            } else {
                console.log('Successfully Deleted');
            }
        })
        res.redirect('/')
    } else {
        List.findOneAndUpdate({name: list}, {$pull: {items: {_id: itemToDelete}}}, (err)=>{
            if(!err) {
                console.log('successfully deleted');
            }
        })
        res.redirect('/'+list)
    }
})

app.listen(3000, () => {
    console.log("server started on port 3000")
})