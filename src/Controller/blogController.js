const blogModel = require('../models/blogModel')
const authorModel = require('../models/authorModel')
const jwt   = require("jsonwebtoken")


const createBlog = async function (req, res) {
  try {
    let data = req.body
   
    let { authorId, title, body, category} = req.body

    if (!title) {
      res.status(400).send({ error: "Title is missing" })
    }

    if (title.length < 2) {
      res.status(400).send({ error: "length of title must be greater than 2" })
    }

    if (!body) {
      res.status(400).send({ error: "Body is missing" })
    }

    if (body.length < 50) {
      res.status(400).send({ error: "length of body must be greater than 50" })
    }

    if (!category) {
      res.status(400).send({ error: "category is missing" })
    }
    if (!authorId) {
      return res.status(400).send({ msg: 'please enter authorId' })
    }

    let validId = await authorModel.findById(authorId)
    if (!validId) {
      return res.status(400).send({ msg: 'authorId is not correct' })
    }

    let savedData = await blogModel.create(data)
    res.status(201).send({status:true ,data: savedData })
  }

  catch (err) {
    console.log(err)
    res.status(500).send({ err: err.message })
  }
}



const getBlogs = async (req, res) => {
  try {
    let data = req.query
    
    console.log(data);
   

    let blog = await blogModel.find({ 
      $and: [{isPublished: true}, {isDeleted: false}, data ]
    })
    
    if (!blog[0]) {
      res.status(404).send({ err: 'data not found/ all deleted' })
    }
    res.status(200).send({status :true, msg: blog })
  } catch (err) {
    console.log(err)
    res.status(500).send({ err: 'server not found' })
  }
}

const updateBlog = async (req, res) => {
  try {
  
    let data = req.body
    let Id = req.params.blogsId
    let tags = req.body.tags
    let subcategory = req.body.subcategory
    let user = await blogModel.findById(Id)
    let updatedTags = user.tags
    if (tags) {
      updatedTags.push(tags)
    }
    
    let updatedSubCategory = user.subcategory
    if (subcategory) {
      updatedSubCategory.push(subcategory)
    }
    
    console.log(data)

    let updatedBlog = await blogModel.findOneAndUpdate(
      { _id: Id  , isDeleted:false},
      {
        title: data.title,
        tags: updatedTags,  
        subcategory: updatedSubCategory, 
        body: data.body,
        isPublished:data.isPublished
      },
      { returnDocument: 'after' },
    )
    console.log(updatedBlog)
    if (!updatedBlog) {
      res.status(404).send({ error: 'Document not found / already deleted' })
    }
    res.status(200).send({ status:true,Updates: updatedBlog })
  } catch (err) {
    console.log(err)
    res.status(500).send({ msg: err.message })
  }
}

const deleteBlog = async (req, res) => {
  try {
    let Id = req.params.blogsId

    let deletedDoc = await blogModel.findOneAndUpdate(
      { _id: Id, isDeleted:false },
      { isDeleted: true, deletedAt: Date() },
      { returnDocument: 'after' },
    )
    console.log(deletedDoc)
    if (!deletedDoc) {
      res
        .status(404)
        .send({ error: 'Document not found with Given Id/ Already deleted' })
    }
    res.status(200).send({status:true, Updates: deletedDoc })
  } catch (err) {
    console.log(err)
    res.status(500).send({ msg: err.message })
  }
}


const deleteByParams = async (req, res) => {
  try {
    let { authorsId, isPublished, tags, category, subcategory } = req.query

    if (!req.query) {
      return res
        .status(404)
        .send({ error: 'Inavlid Input---Query shoud not be emplpty' })
    }

    let deletedDoc = await blogModel.updateMany({
      isDeleted: false,  $or: [
      { authorId: authorsId },
      { isPublished: isPublished },
      { tags: tags },
      { category: category },
      { subcategory: subcategory }
    ],},
      { isDeleted: true, deletedAt: Date()}, { returnDocument: 'after' })
    console.log(deletedDoc)
    if (!deletedDoc) {
      res
        .status(404)
        .send({ error: 'Document not found / given data not exists/ is Already Deleted' })
    }
    res.status(200).send({status:true, Updates: deletedDoc })

    const withTags = blogModel.findOneAndUpdate({ tags: { $contains: tags } }, { isDeleted: true, deletedAt: Date() }, { returnDocument: 'after' })

    console.log(withTags);
  } catch (err) {
    console.log(err)
    res.status(500).send({ msg: err.message })
  }
}


module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlog = deleteBlog
module.exports.deleteByParams = deleteByParams
