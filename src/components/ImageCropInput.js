import React from 'react'
import Cropper from 'react-easy-crop'
import { getOrientation } from 'get-orientation/browser'
import './ImageCropInput.css'
import Modal from 'react-modal'

const ORIENTATION_TO_ANGLE = {
  '3': 180,
  '6': 90,
  '8': -90,
}

const createImage = url =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const safeArea = Math.max(image.width, image.height) * 2
  canvas.width = safeArea
  canvas.height = safeArea
  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate(getRadianAngle(rotation))
  ctx.translate(-safeArea / 2, -safeArea / 2)
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )
  const data = ctx.getImageData(0, 0, safeArea, safeArea)
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  )
  return new Promise(resolve => {
    canvas.toBlob(file => {
      resolve(URL.createObjectURL(file))
    }, 'image/jpeg')
  })
}

export async function getRotatedImage(imageSrc, rotation = 0) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const orientationChanged =
    rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270
  if (orientationChanged) {
    canvas.width = image.height
    canvas.height = image.width
  } else {
    canvas.width = image.width
    canvas.height = image.height
  }

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(image, -image.width / 2, -image.height / 2)

  return new Promise(resolve => {
    canvas.toBlob(file => {
      resolve(URL.createObjectURL(file))
    }, 'image/jpeg')
  })
}

function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(file)
  })
}

export default class ImageCropInput extends React.Component {
  state = {
    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 4 / 3,
    croppedAreaPixels: null,
    croppedImage: null,
    isCropping: false,
    modalIsOpen: false
  }
  
  onCropChange = crop => {
    this.setState({ crop })
  }

  onCropComplete = (_, croppedAreaPixels) => {
    this.setState({
      croppedAreaPixels,
    })
  }

  onZoomChange = zoom => {
    this.setState({ zoom })
  }

  crop = async () => {
    try {
      this.setState({
        isCropping: true,
      })
      const croppedImage = await getCroppedImg(
        this.state.imageSrc,
        this.state.croppedAreaPixels
      )
      this.setState({
        croppedImage,
        isCropping: false,
      })

      if (this.props.onValidateCrop) {
        this.props.onValidateCrop(croppedImage)
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.setState({
        isCropping: false,
        modalIsOpen: false
      })
    }
  }

  onFileChange = async e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      let imageDataUrl = await readFile(file)

      const orientation = await getOrientation(file)
      const rotation = ORIENTATION_TO_ANGLE[orientation]
      if (rotation) {
        imageDataUrl = await getRotatedImage(imageDataUrl, rotation)
      }

      this.setState({
        imageSrc: imageDataUrl,
        crop: { x: 0, y: 0 },
        zoom: 1,
        modalIsOpen: true
      })
    }
  }

  closeModal = () => {
    this.setState({modalIsOpen: false})
  }

  render() {
    return (
      <div className="image-cropper-input">
        {this.props.renderInput ? this.props.renderInput(this.onFileChange): <input  type="file" onChange={this.onFileChange} />}
        {this.state.imageSrc && (
            <Modal
              isOpen={this.state.modalIsOpen}
              onRequestClose={this.closeModal}
              contentLabel="Example Modal"
              ariaHideApp={false}
            >
                <div className="crop-container">
                  <Cropper
                    image={this.state.imageSrc}
                    crop={this.state.crop}
                    zoom={this.state.zoom}
                    aspect={this.state.aspect}
                    onCropChange={this.onCropChange}
                    onCropComplete={this.onCropComplete}
                    onZoomChange={this.onZoomChange}
                  />
                </div>
                <div className="buttons">
                  {this.props.renderCancelButton ? 
                    this.props.renderCancelButton(this.closeModal, this.state.isCropping) : 
                    <button onClick={this.closeModal} disabled={this.state.isCropping}>Annuler</button> 
                  }
                  {this.props.renderValidateButton ? 
                    this.props.renderValidateButton(this.crop, this.state.isCropping) : 
                    <button onClick={this.crop} disabled={this.state.isCropping}>Valider</button> 
                  }
                </div>
            </Modal>   
        )}
      </div>
    )
  }
}


