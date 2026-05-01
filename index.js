require("node:dns/promises").setServers(["1.1.1.1","8.8.8.8"]);


const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cors = require("cors")
dotenv.config()
const mongoose = require("mongoose")
const Path = require("path")
app.use(express.urlencoded({extended:true}))
app.use(express.json({limit:"50mb"}))
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-vercel-app.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.set('view engine', 'ejs')
console.log(process.env.DB_URI);


mongoose.connect(process.env.DB_URI)
.then(() => {
 console.log( "Database connected successfully")
})
.catch((err)=> {
  console.log(err);
  console.log("Error connecting to database");
  
})


// 100 - informational
// 200 - response okay
// 300 - redirectional
// 400 - user error
// 500 -  server error 


//app.get(Path, callback)
//can send html, audio 


const UserRouter = require("./routers/user.routes")
app.use("/api/v1", UserRouter)


const products = [
    {
      name: "Garri (Ijebu)",
      description: "Fine textured cassava flakes, popular in southwestern Nigeria.",
      price: 3500,
      category: "Food",
      image: "https://source.unsplash.com/600x400/?cassava,garri",
      inStock: true
    },
    {
      name: "Palm Oil (1L)",
      description: "Pure red palm oil sourced locally from eastern Nigeria.",
      price: 2500,
      category: "Food",
      image: "https://source.unsplash.com/600x400/?palm-oil",
      inStock: true
    },
    {
      name: "Ankara Fabric",
      description: "Colorful African print fabric used for clothing and crafts.",
      price: 8000,
      category: "Fashion",
      image: "https://source.unsplash.com/600x400/?ankara,fabric",
      inStock: true
    },
    {
      name: "Yam Tubers (Pack)",
      description: "Fresh yam tubers suitable for pounding or cooking.",
      price: 6000,
      category: "Food",
      image: "https://source.unsplash.com/600x400/?yam,tubers",
      inStock: false
    },
    {
      name: "Shea Butter",
      description: "Natural moisturizer made from shea nuts.",
      price: 2000,
      category: "Beauty",
      image: "https://source.unsplash.com/600x400/?shea-butter",
      inStock: true
    },
    {
      name: "Suya Spice Mix",
      description: "Spicy peanut-based seasoning used for suya meat.",
      price: 1500,
      category: "Food",
      image: "https://source.unsplash.com/600x400/?suya,spices",
      inStock: true
    },
    {
      name: "Adire Fabric",
      description: "Traditional tie-dye fabric from southwestern Nigeria.",
      price: 10000,
      category: "Fashion",
      image: "https://source.unsplash.com/600x400/?adire,tie-dye",
      inStock: true
    },
    {
      name: "Honey (Natural)",
      description: "Pure, unprocessed honey from local farms.",
      price: 4000,
      category: "Food",
      image: "https://source.unsplash.com/600x400/?natural,honey",
      inStock: false
    },
    {
      name: "Plantain Chips",
      description: "Crunchy fried plantain snacks.",
      price: 1000,
      category: "Snacks",
      image: "https://source.unsplash.com/600x400/?plantain,chips",
      inStock: true
    },
    {
      name: "Beaded Necklace",
      description: "Handcrafted traditional beads for cultural attire.",
      price: 5000,
      category: "Accessories",
      image: "https://source.unsplash.com/600x400/?african,beads",
      inStock: true
    },
    {
      name: "Kulikuli",
      description: "Crunchy snack made from groundnuts.",
      price: 800,
      category: "Snacks",
      image: "https://source.unsplash.com/600x400/?groundnuts,snack",
      inStock: true
    },
    {
      name: "Zobo Drink",
      description: "Refreshing hibiscus drink, locally made.",
      price: 1200,
      category: "Beverage",
      image: "https://source.unsplash.com/600x400/?hibiscus,drink",
      inStock: true
    }
  ];
  let user = "Idris Idris"
  let gender = 'male'



  app.get("/index" , (req, res) => {
  res.render('index', {products})
})

  app.get("/init" , (req, res) => {
  res.render('init', {user, gender})
})


app.post("/delete/:id", (req, res) => {

const {id} = req.params

products.splice(id, 1)
 res.render('index', {products})

// console.log(id);
})

app.get("/editProduct/:id", (req, res) => {
  const {id} = req.params

  res.render("editProduct")

})


app.post("/editProduct/:id", (req, res) => {
  const {id} = req.params

  products.splice(id, 1, req.body)
  res.render('index', {products})
})

app.get ("/addProduct/", (req, res ) => {
    res.render("addProduct")
})
  

app.post ("/addProduct/",(req, res ) => {

  products.push(req.body)

  res.render("index", {products})
})
  



app.get("/", (req, res) => {


let indexPath = Path.join(__dirname, "/index.html")
    
// console.log(__dirname+"/index.html");
res.sendFile(indexPath) //  res.send(info)  //sends a responce to the server  // iy is importwnt to aleays send a response 
}) 


app.get("/products", (req, res) => {
    // res.redirect('/')
    res.json(products)
    console.log(products)
})

// app.get("/product-image", (req, res) => {
//     res.send(`
//         <h2>Garri (Ijebu)</h2>
//         <img src="https://source.unsplash.com/600x400/?cassava,garri" />
//     `);
// });





// app.listen(port, call
// back)
//react node react node

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log("Server cannnot start");
        
    } else {
        console.log(`Server started on port ${process.env.PORT}`);
    }
})


// cluster groub of
// database
// collections 
// documents 


 