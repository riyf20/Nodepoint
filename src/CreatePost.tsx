import React, { useRef, useState } from 'react'
import { Field, FieldLabel } from "./components/ui/field";
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { submitPost, uploadMedia } from './services/appwriteServices';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, type UploadHandle } from './components/ui/upload-icon';
import { TrashIcon, type DashboardIconHandle} from './components/ui/trash-icon';

// Route: "/createpost"
// Create page: Allows logged in user to create their own posts.
function CreatePost() {

  // Input fields
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // Input validity fields
  const [titleInvalid, setTitleInvalid] = useState(false)
  const [bodyInvalid, setBodyInvalid] = useState(false) 

  // Appended images and their previews
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // Image picker ref
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Selected image index (shows preview in model)
  const [openIndex, setOpenIndex] =  useState<number | null>(null)

  // Animated Icon refs
  const uploadIconRef = useRef<UploadHandle>(null)
  const trashIconRef = useRef<DashboardIconHandle>(null)

  // Image picker handler
  const handleFiles = async(e: React.ChangeEvent<HTMLInputElement>) => {

    const files = e.target.files

    if(!files) return

    const fileArray = Array.from(files)

    // Stores selected images and their previews
    setImages(prev => [...prev, ...fileArray])
    const previews = fileArray.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...previews])
  }

  // Deletes user selected image
  const handleDelete = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));

    if(openIndex === index) setOpenIndex(null)
  };

  // Router navigation
  let navigate = useNavigate();

  // TO DO: loading model when posting

  // Will upload post
  const handlePost = async () => {

    // Logic Checks
    const fields = [
      { value: title, setInvalid: setTitleInvalid },
      { value: body, setInvalid: setBodyInvalid },
    ];    

    let hasEmptyField = false;

    // Loops through all fields to check if empty --> show error if true
    fields.forEach(({ value, setInvalid }) => {
      if (!value.trim()) {
        setInvalid(true);
        hasEmptyField = true;
      }
    });
    
    // Makes sure all fields are entered
    if (hasEmptyField) {
      return;
    }

    // Will upload all images [stored ids will be used when uploading full post]
    let allMediaIds: string[] = []
    if(images.length > 0) {
      
      try {
        const allMedia = await Promise.all(
          images.map(async (image:File) => {
            
            const mediaResponse = await uploadMedia(image)

            return(mediaResponse.$id)
  
          })
        )

        allMediaIds = allMedia

      } catch (error:any) {
        console.log("Error [CreatePost.tsx]: Error uploading media")
        console.log(error.message)
      }
    }

    // Uploads post with array of image ids
    try {

      const id = localStorage.getItem('userid') ?? ''
      await submitPost(title, body, id, allMediaIds)

      // Return to homepage
      navigate('/')
    } catch (error:any) {
      
      console.log("Error [CreatePost.tsx]: Error posting")
      console.log(error.message)
    }


  }


  return (
    <div className='flex flex-col w-full items-center justify-center '>

      <div className=' w-[90%] mt-6 items-center justify-center'>

        <div className=''>
          <p className='text-[#27B1FC] font-bold text-[24px]' >Create a new post</p>
        </div>

        <div className='border-4 border-[#27B1FC]/60 mt-4 p-4 flex flex-col gap-6 rounded-2xl'>
          
          <Field>

            <FieldLabel htmlFor={`input-field-title`} className={`text-[18px] font-bold transition-all duration-350 ${titleInvalid && 'text-red-500' } `}>
              Title{ titleInvalid && ' is required.' }
            </FieldLabel>

            <Input
              id={`input-field-title`}
              type={'text'}
              value={title}
              placeholder={`Enter a title`}
              aria-invalid={titleInvalid}
              onChange={(e) => {
                setTitleInvalid(false)
                setTitle(e.target.value)
              }}
              className={` transition-all duration-350 ${titleInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''} `}
            />

          </Field>


          <Field>
            
            <FieldLabel htmlFor={`input-field-title`} className={`text-[18px] font-bold transition-all duration-350 ${bodyInvalid && 'text-red-500' } `}>
              Body{ titleInvalid && ' is required.' }
            </FieldLabel>
            
            <Textarea 
              id={`input-field-body`}
              value={body}
              placeholder={`Enter your body`}
              aria-invalid={titleInvalid}
              onChange={(e) => {
                setBodyInvalid(false)
                setBody(e.target.value)
              }}
              className={` transition-all duration-350 ${bodyInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''} `}

            />
          </Field>

          <input 
            type="file" 
            ref={fileInputRef}
            id="imageUpload" 
            accept="image/*" 
            multiple 
            onChange={handleFiles}
            style={{ display: 'none' }} 
          />

          <FieldLabel htmlFor={`media`} className={`text-[18px] font-bold transition-all duration-350 `}>
            Upload Pictures
          </FieldLabel>

            {previewUrls.length > 0 && (
              <div className='flex flex-wrap gap-4 mt-4'>
                {previewUrls.map((url, index) => (
                  <div key={index} className='relative'>
                    <Dialog open={openIndex === index} onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)} >

                      <DialogTrigger asChild>
                        <img
                      src={url}
                      alt={`Preview ${index}`}
                      className='w-32 h-32 object-cover rounded-lg cursor-pointer hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-350'
                    />
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-md border-transparent">

                        <DialogHeader>
                          <DialogTitle className='text-[20px]'>Image: {images[index].name}</DialogTitle>
                          <DialogDescription>
                            <img
                              src={url}
                              alt={`Preview ${index} - dialog`}
                              className='w-96 h-w-96 object-cover rounded-lg mt-2'
                            />
                          </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex">
                          <Button type="button" className='w-full' onClick={() => {setOpenIndex(null)}} >Close</Button>
                          
                          <Button 
                            onClick={() => {handleDelete(index)}} className="w-full text-destructive hover:bg-destructive/30 [&_svg]:text-destructive hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-350"
                            onMouseEnter={() => {trashIconRef.current?.startAnimation()}} onMouseLeave={() => {trashIconRef.current?.stopAnimation()}}
                          > 
                            <TrashIcon ref={trashIconRef} /> Delete
                          </Button>
                        </DialogFooter>

                      </DialogContent>

                    </Dialog>
                  </div>
                ))}
              </div>
            )}

          <Button variant="default" className='w-[20%] hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-350'
            onClick={() => {fileInputRef.current?.click()}}
            onMouseEnter={() => {uploadIconRef.current?.startAnimation()}} onMouseLeave={() => {uploadIconRef.current?.stopAnimation()}}
          >
            <UploadIcon ref={uploadIconRef} /> {images.length > 0 ? 'Add More Files' : 'Browse Files'}
          </Button>


          <Button variant="default" className='self-center w-[10%] border-2 border-[#27B1FC]/70 bg-[#27B1FC]/80 hover:bg-[#27B1FC]/70'
            onClick={handlePost}
          >
            Post
          </Button>

        </div>

      </div>
    </div>
  )
}

export default CreatePost