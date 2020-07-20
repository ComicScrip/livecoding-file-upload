import React, {useState, useEffect} from "react";
import "../styles.css";
import Axios from 'axios'
import ImageCropInput from './ImageCropInput'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const baseURL = process.env.REACT_APP_API_BASE_URL
const axios = Axios.create({baseURL})

function App() {
  const classes = useStyles();
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('An awesome blog post')
  const [mainPicture, setMainPicture] = useState(null)
  const [content, setContent] = useState("blog post content")

  useEffect(() => {
    axios.get('/posts').then(res => res.data).then(data => setPosts(data))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    formData.append('title', title);
    const mainPictureFile = await fetch(mainPicture)
      .then(r => r.blob())
      .then(blobFile => new File([blobFile], "image.jpg", { type: "image/jpg" }))
    formData.append("main_picture", mainPictureFile);
    axios.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
    })
    .then(res => res.data)
    .then(data => setPosts([...posts, {content, title, main_picture_url: data.main_picture_url}]))
  }

  return (
    <div className={"App " + classes.root}>
      <h2>New Post</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
        <br/>
        <textarea onChange={e => setContent(e.target.value)} value={content}>
        </textarea>
        <br/>
        <ImageCropInput onValidateCrop={setMainPicture} 
          renderInput={onChange => <input  type="file" onChange={onChange} />}
          renderValidateButton={
            (onClick, disabled) => 
              <Button onClick={onClick} disabled={disabled} variant="contained" color="primary">
                Valider
              </Button>
          }
          renderCancelButton={
            (onClick, disabled) => 
              <div style={{marginRight: 50, display: 'inline-block'}} >
                <Button onClick={onClick} disabled={disabled} variant="outlined" color="secondary">
                  Annuler
                </Button>
              </div>
          }
        />
        {mainPicture && <img width="320" height="180" src={mainPicture}/>}
        <br/>
        <input type="submit" value="create new post"/>
      </form>
      <h2>Post List</h2>
      {posts.map(post => {
        return (
          <div className="post" key={post.id}>
            <h2>{post.title}</h2>
            {post.main_picture_url && <img src={baseURL + '/' + post.main_picture_url}/>}
            <p>{post.content}</p>
          </div>
        )
      })}
    </div>
  );
}

export default App;
