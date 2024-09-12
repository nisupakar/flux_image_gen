# Project overview
Use this guide to build a web app where users can give a text prompt to generate AI photos using a model hosted on Replicate

# Feature requirements
- We will use Next.js, Shadcn, Lucid, Supabase, Clerk
- Create a form where users can enter a prompt, and click on a button that calls the replicate model to generate the AI image
- Have a nice UI & animation when the image generated is blank or generating
- Display all the images ever generated in a grid 
- When user hovers over an image, an icon button for like & one for downloading the image should show up

# Relevant documents
## How to use Replicate Flux Dev model to generate AI images

Set the REPLICATE_API_TOKEN environment variable
export REPLICATE_API_TOKEN=r8_9xo**********************************

Install Replicate’s Node.js client library
npm install replicate

Run lucataco/flux-dev-lora using Replicate’s API. Check out the model's schema for an overview of inputs and outputs.

import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "a beautiful castle frstingln illustration",
    hf_lora: "alvdansen/frosting_lane_flux"
};

const output = await replicate.run("lucataco/flux-dev-lora:613a21a57e8545532d2f4016a7c3cfa3c7c63fded03001c2e69183d557a929db", { input });
console.log(output)

# Input Schema for replicate API

seed
integer
Random seed. Set for reproducible generation

image
uri
Input image for image to image mode. The aspect ratio of your output will match this image

prompt
string
Prompt for generated image

hf_lora
string
HF, Replicate, CivitAI, or URL to a LoRA. Ex: alvdansen/frosting_lane_flux

lora_scale
number
Scale for the LoRA weights

num_outputs
integer
Number of images to output.

aspect_ratio
string
Aspect ratio for the generated image

output_format
string
Format of the output images

guidance_scale
number
Guidance scale for the diffusion process

output_quality
integer
Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs

prompt_strength
number
Prompt strength (or denoising strength) when using image to image. 1.0 corresponds to full destruction of information in image.

num_inference_steps
integer
Number of inference steps

# Current file structure

CURSOR_TEST1
├── app
│   ├── fonts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── components
│       └── ui
│           ├── button.tsx
│           ├── card.tsx
│           └── input.tsx
├── lib
├── node_modules
├── requirements
│   └── frontend_instructions.md
├── .eslintrc.json
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json

# Rules
- All new components should go into /components and be named like example-component.tsx unless otherwise specified
- All new pages go in /app
