//moya code
//pos 

body {
margin: 0;
font-family: Arial, sans-serif;
background-color: #f2f4f6;
}
 

.sidebar {
width: 200px;
height: 100vh;
background-color: #164018;
color: white;
float: left;
padding: 20px;
box-sizing: border-box;
}
 
.sidebar h2 {
margin-top: 0;
margin-bottom: 30px;
}
 
.sidebar button {
width: 100%;
padding: 8px;
background-color: #1c5e1c;
color: white;
border: none;
border-radius: 5px;
cursor: pointer;
}
 
.sidebar button:hover {
background-color: #287a28;
}
 

.main {
margin-left: 220px;
padding: 20px;
}
 
.main h1 {
text-align: center;
color: #222;
margin-bottom: 20px;
}
 

.card {
background-color: white;
border-radius: 8px;
padding: 15px;
margin-bottom: 20px;
box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
 

#products {
width: 45%;
float: left;
}
 
#products input {
width: 95%;
padding: 8px;
border: 1px solid #ccc;
border-radius: 5px;
margin-bottom: 15px;
}
 
.product {
background-color: #f9f9f9;
border: 1px solid #ddd;
border-radius: 5px;
margin-bottom: 10px;
padding: 8px;
overflow: hidden;
}
 
.product img {
float: left;
margin-right: 10px;
border-radius: 5px;
}
 
.product p {
margin: 0;
font-size: 14px;
color: #333;
}
 

.right-side {
width: 45%;
float: right;
}
 
#current-sale {
position: relative;
}
 

.sale-header {
overflow: hidden; 
margin-bottom: 10px;
}
 
.sale-header h2 {
float: left;
margin: 0;
}
 
.sale-header .clear {
float: right;
background-color: #dc3545;
color: white;
border: none;
border-radius: 5px;
padding: 5px 10px;
cursor: pointer;
}
 
.sale-header .clear:hover {
background-color: #b52b27;
}
 
.sale-item {
background-color: #f9f9f9;
border: 1px solid #ddd;
border-radius: 5px;
padding: 8px;
margin-top: 10px;
overflow: hidden;
}
 
.sale-item img {
float: left;
margin-right: 10px;
border-radius: 5px;
}
 
.sale-item p {
margin: 0;
font-size: 14px;
}
 
.sale-item button {
background-color: #007bff;
color: white;
border: none;
border-radius: 4px;
width: 25px;
height: 25px;
cursor: pointer;
}
 
.sale-item button:hover {
background-color: #0056b3;
}
 

#total {
text-align: center;
}
 
#total h2 {
font-size: 18px;
margin-bottom: 10px;
}
 
#total button {
background-color: #007bff;
color: white;
border: none;
padding: 10px 25px;
border-radius: 5px;
cursor: pointer;
}
 
#total button:hover {
background-color: #0056b3;
}
