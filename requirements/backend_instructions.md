# Project overview
Use this guide to build the backend for the web app

# Tech stack
- Next.js, Supabase, Clerk

# Tables & buckets already created 
Supabase storage bucket: "Images"

CREATE TABLE profiles (
    user_id TEXT PRIMARY KEY,
    credits INTEGER DEFAULT 3 NOT NULL,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);


CREATE TABLE images (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    likes_count NUMERIC DEFAULT 0,
    creator_user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


# Requirements
1. Create user to user table
    1. After a user signin via clerk, we should get the userId from clerk, and check   if  this userId exist in 'profiles' table, matching "user_id"
    2. if the user doesnt exist, then create a user in 'profiles' table
    3. if the user exist already, then proceed, and pass on user_id to functions like generate images
2. Upload generated images to "Images" supabase storage bucket;
    1. When user generating an image, upload the emoji image file returned from Replicate to supabase "Images" storage bucket
    2. Add a row to 'Images' table where the image url to te "images" data table as "image_url", and creator_user_id to be the actual user_id
3. Display all images in image grid
    1. Image grid should fetch and display all images from "Images" data table
    2. when a new image is generated, the image grid should be updated automatically to add the new image to the grid
4. Likes interaction
    1. When user check on 'Like' button, the num_likes should increase on the 'images' table
    2. when user un-check 'Like' button, the num_likes should decrease on the 'images' table
he image information.
Return the saved image data to the client.
Update the UI to display the new image in the grid.
Remember to handle any errors appropriately and consider adding loading states in your UI while the image generation and upload process is ongoing.

# Documentations
## Example of uploading files to supabase storage
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient('your_project_url', 'your_supabase_api_key')

// Upload file using standard upload
async function uploadFile(file) {
  const { data, error } = await supabase.storage.from('bucket_name').upload('file_path', file)
  if (error) {
    // Handle error
  } else {
    // Handle success
  }
}