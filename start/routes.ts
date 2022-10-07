import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import Swal from 'sweetalert2'
import sha1 from 'js-sha1'
import View from '@ioc:Adonis/Core/View'

View.global('isUser',true)

Route.get('/', async ({response, session,view }) => {
  let sessionuser = session.get("username")
  let sessionlogin = session.get("islogin")
  let sessionstatus = session.get("status")
  console.log("namanya" + sessionuser)
  if(!sessionuser && !sessionstatus){
    return response.redirect().toPath("/login")
  }
  const produk = await Database
  .query()  // 👈 gives an instance of select query builder
  .from('products')
  .select('*')
  console.log(sessionstatus)
  if(sessionstatus === "user"){
View.global('isUser',true)
  }
  if(sessionstatus === "admin"){
View.global('isUser',false)

  }
  return view.render('welcome',{
    data:produk,
    penggunas:sessionuser,
    statususer:sessionstatus
  })
})
Route.get('/transaksi', async ({ response,session,view }) => {
  let sessionuser = session.get("username")
  let sessionlogin = session.get("islogin")
  let sessionstatus = session.get("status")
  if(!sessionuser && !sessionstatus){
    return response.redirect().toPath("/login")
  }
  const product = await Database
  .rawQuery(
`select * from products`
    )
  const pengguna = await Database
  .rawQuery(
`select * from penggunas`
    )
  const db = await Database
  .rawQuery(
`select * from penjualans`
    )
  console.log(product)
  return view.render("transaksi",{
    datatrans:db,
    dataproduct:product[0],
    datapengguna:pengguna[0]
  })
})
Route.post('/buattransaksi', async ({ view,request,response,session }) => {

  let formbarang = request.input("nama_barang")
  let formpembeli = request.input("pembeli")
  let alamat = request.input("alamat")
  let tgl_kirim = request.input("tgl_kirim")
  let jumlah_brng = request.input("jumlah_brng")
  let nama_barang = formbarang.split("/")[0]
  let deskripsi = formbarang.split("/")[2]
  let id_barang = formbarang.split("/")[1]
  let id_pembeli = formpembeli.split("/")[0]
  let pembeli = formpembeli.split("/")[1]
  let harga_pcs = formbarang.split("/")[3]
  let harga_total = harga_pcs * jumlah_brng
  console.log(nama_barang)
const addnew = await Database
  .rawQuery(
`insert into penjualans (
  product_id,
  user_id,
  pembeli,
  alamat,
  nama_barang,
  deskripsi,
  tgl_kirim,
  jumlah_brng,
  harga_total,
  harga_pcs
)
  values(
  ${id_barang},
  ${id_pembeli},
  '${pembeli}',
  '${alamat}',
  '${nama_barang}',
  '${deskripsi}',
  '${tgl_kirim}',
  ${jumlah_brng},
  ${harga_total},
  ${harga_pcs}

  )
`  )
    return view.render('successinput',{id:true})

})
Route.post('/edittransaksi/:id', async ({ request,view,response,session }) => {
  let paramid = request.params("id").id
  let nama_pembeli = request.input("editname")
  let editalamat = request.input("editalamat")
  let edittglkirim = request.input("edittglkirim")
  let editjumlah_brng = request.input("editjumlah_brng")
  let hargatotal = request.input("hargatotal")
  let hargapcs = request.input("hargapcs")
  let grandtotal = hargapcs * editjumlah_brng
const edittransaksi = await Database
  .rawQuery(
`update penjualans
set pembeli = '${nama_pembeli}',
alamat = '${editalamat}',
tgl_kirim = '${edittglkirim}',
jumlah_brng = ${editjumlah_brng},
harga_total = ${grandtotal}
where id = ${paramid}
`
    )
  return view.render('successinput')

})
Route.get('/logout', async ({ response,session }) => {
  session.clear()
  return response.redirect().toPath("/login")
})
Route.get('/addproduct', async ({ view }) => {
  return view.render('addproduct')
})
Route.get('/lihattransaksi', async ({ view }) => {
  const penjualan = await Database
  .rawQuery(
`select * from penjualans`
    )
  return view.render('tabletransaksi',{data:penjualan[0]})
})
Route.get('/login', async ({ view,session }) => {
    let sessionuser = session.get("username")
  let sessionlogin = session.get("islogin")
  let sessionstatus = session.get("status")
  if(sessionuser && sessionstatus){
    return response.redirect().toPath("/")
  }
  return view.render('login')
})
Route.post('/login/process', async ({ session,request,response,view }) => {
  let user = request.input("username")
    let password = request.input("password")
    let hashedPassword =  sha1(password)

const db = await Database
  .rawQuery(`
    select * from penggunas where nama ='${user}'
    and password = '${hashedPassword}'
    `)
if(db[0].length == 1){
  db[0].forEach((p)=>{
 session.put('username', p.nama)
 session.put('islogin', sha1(user))
 session.put('status', p.status)
  })
  return response.redirect().toPath("/")
}
else{
  console.log("kesalahan ada dua atau salah")
}

})
Route.get('/printproduct/:id', async ({ request,view }) => {
  let paramid = request.params("id").id
  const users = await Database
  .rawQuery("select * from products where id = " + paramid )  // 👈 gives an instance of select query builder
  console.log(users[0])
  return view.render('printproduct',{data:users[0]})

})
Route.get('/users', async ({ session,view }) => {
   let sessionuser = session.get("username")
  let sessionlogin = session.get("islogin")
  let sessionstatus = session.get("status")
  if(!sessionuser && !sessionstatus){
    return response.redirect().toPath("/login")
  }
   const users = await Database
  .query()  // 👈 gives an instance of select query builder
  .from('penggunas')
  .select('*')
  return view.render('userspage',{data:users})
})

Route.post('/daftarpengguna', async ({response,request, view }) => {
    let user = request.input("username")
    let password = request.input("password")
    let hashedPassword =  sha1(password)
  const db = await Database
  .rawQuery(`
    select * from penggunas where nama ='${user}'
    `)
  if(JSON.stringify(db[0] === '[]')){
  const add = await Database
  .insertQuery() 
  .table('penggunas')
  .insert({
    nama:user,
    password:hashedPassword,
    status:"user",
  })
  if(add.length > 0 ){
    return response.redirect().toPath("/login")
  }
  }
  if(JSON.stringify(db[0] !== '[]'){
    return view.renderRaw(`sudah ada`)

  }

 
})

Route.get('/editproduct/:id', async ({ request,view }) => {
  let paramid = request.params("id").id
  const users = await Database
  .rawQuery("select * from products where id = " + paramid )  // 👈 gives an instance of select query builder
  return view.render('editproduct',{data:users[0]})

})
Route.get('/edituser/:id', async ({ request,view }) => {
  let paramid = request.params("id").id
  const users = await Database
  .rawQuery("select * from penggunas where id = " + paramid )  // 👈 gives an instance of select query builder
  return view.render('editpenggunas',{data:users[0]})

})
Route.get('/deleteproduct/:id', async ({ response,request,view }) => {
  let paramid = request.params("id").id
  const users = await Database
  .rawQuery("delete from products where id = " + paramid )  // 👈 gives an instance of select query builder
  return response.redirect().toPath("/")

})
Route.get('/deletetransaksi/:id', async ({ response,request,view }) => {
  let paramid = request.params("id").id
  const users = await Database
  .rawQuery("delete from penjualans where id = " + paramid )  // 👈 gives an instance of select query builder
  return response.redirect().toPath("/")

})
Route.get('/deleteuser/:id', async ({ response,request,view }) => {
  let paramid = request.params("id").id
  const users = await Database
  .rawQuery("delete from penggunas where id = " + paramid )  // 👈 gives an instance of select query builder
  return response.redirect().toPath("/")

})
Route.post('/editproses', async ({ response,request, view }) => {
    let nama_barang =request.input("nama_barang")
    let deskripsi =request.input("deskripsi")
    let stok =request.input("stok")
    let id =request.input("id")
    let harga =request.input("harga")
const users = await Database
  .rawQuery(`update products set 
    nama_barang = '${nama_barang}',
    deskripsi = '${deskripsi}',
    harga = '${harga}',
    stok = '${stok}'
    where id = ${id}
    `)
    if(users.length !== 0 ){
  console.log("data berhasil terupdate")
  return response.redirect().toPath("/")
    }
 
})
Route.post('/editpenggunaproses', async ({ response,request, view }) => {
    let nama =request.input("nama")
    let status =request.input("status")
    let id =request.input("id")

const users = await Database
  .rawQuery(`update penggunas set 
    nama = '${nama}',
    status = '${status}'
    where id = ${id}
    `)
    if(users.length !== 0 ){
  console.log("user berhasil terupdate")
  return response.redirect().toPath("/users")
    }
 
})
Route.post('/processproduct', async ({request,view }) => {
 const add = await Database
  .insertQuery() 
  .table('products')
  .insert({
    nama_barang:request.input("nama_barang"),
    deskripsi:request.input("deskripsi"),
    harga:request.input("harga"),
    stok:request.input("stok"),
  })
if(add){
  return view.render('successinput',{id:true})
}
})
