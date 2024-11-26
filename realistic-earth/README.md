# Basic Three.js Template

A streamlined boilerplate for Three.js projects, designed to get you up and running quickly.

![Boilerplate demo](./static/boilerplate.gif)

## 🚀 Quick Start

Follow these steps to set up your project using this boilerplate:

```bash
# Clone the repository and cd into the project
git clone https://github.com/zoyron/threejs-boilerplate.git your-project-name
cd your-project-name

# Remove git history and start fresh with your own Git history
rm -rf .git
git init

# Install dependencies
npm install

# Run the development server
npm run dev
```

Your project is now running at http://localhost:5173 (or another port if 5173 is occupied).

## Threejs Project Structure

### Base Setup(includes the following):

- Canvas
- Scene
- Sizes(the object)

### The Camera, groups(optional) and lights(optional):

- Perspective Camera(most usualy and popular choice)
- Lights(optional, with ambient light being the most popular choice)

### Creating an object and adding it to scene

- Creating geometry or points-geometry; could be inbuilt, custom, random or using shaders
- Creating material or points-material; could be inbuilt, custom, random or using shaders
- Creating mesh or points; could be inbuilt, custom, random or using shaders

> above three are the points where we mostly use shaders

- Adding the created mesh or points to the scene or group

### Renderer and Resizing

- Adding a scene renderer
- Adding a window resizing event listener, and updating the render inside it

### Controls and Animate function

- Adding orbit controls and damping them if required
- adding the animate() function, and giving necessary logic and functionality to it
- calling the animate() function
