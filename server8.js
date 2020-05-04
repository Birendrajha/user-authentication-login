const express = require('express')
const User = require('./models/userSchema')
const auth = require('./userauth/auth')
var otpGenerator = require('otp-generator')
const multer = require('multer')
const path=require('path')
require('./models/lan_connection')
 
const app = express()
app.use(express.json())

// const storage = multer.diskStorage(
//     {
//         destination: function(req, file, cb)
//         {
//             console.log("pwe")
          
//            cb(null,'./uploads/')
           
//         },
        
//         filename: function(req, file, cb)
//         {console.log("asd")
       
//         cb(null, file.originalname)
//         }
        
//      })
//     const fileFilter = (req, file, cb) =>
//     {
//         if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'||file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg')
//         {
//             console.log("aa1")
//             cb(null, true);
            
//         }
//         else
//         {
//             console.log("vvv")
//             cb(null, false);
//         }
//     };
    
//      const upload = multer(
//      {
        
//         storage,
//         limits:
//         {
//             fileSize: 100000000
//         },
//         fileFilter
       
//     })
    
//     app.post('/pictureupload',upload.single('picture1'), async(req, res, next) =>
//     {
//         console.log("st")
//         if (!req.file)
//           return res.send('Please upload a file')
//         var tempPath = req.file.path
//         var a = req.file.originalname
       
//         var theFile = tempPath
//         console.log(a)
//         console.log("ss1")
//         var img = new User({
        
//         image:theFile
       
         
//         })
//         console.log(img)
//         img.save()
    
//           res.send("file is upload")
//     });
const upload=multer({

    limits:{
        filesize:100000000
    },
    fileFilter(req,file,cb) {
       if (!file.originalname.endsWith('.jpg')) {
            return cb (new Error('please upload an image'))
        }
        cb(undefined,true)
    }
}) 
app.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    req.user.avatar=req.file.buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})   








app.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})
app.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.image) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.image)
    } catch (e) {
        res.status(404).send()
    }
})

app.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})



app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


app.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

app.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

app.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})



app.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.params.id)

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})
////


app.listen(8859, () => {
    console.log(`Server is running`)
})
