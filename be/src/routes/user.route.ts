import express from "express";
import userController from "../controllers/user.controller";
import multer from '../utils/multer';
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";

const userRouter = express.Router();

userRouter.get('/get-profile',[authentication, isNotDeleted], userController.getProfile);
userRouter.get('/get-user-profile/:id', userController.getUserProfile);
userRouter.patch('/update',[authentication, isNotDeleted], userController.updateUser);
userRouter.patch('/update-avatar',[authentication, isNotDeleted, multer.getUpload().single('file')], userController.updateAvatar);
userRouter.patch('/follow-user', [authentication, isNotDeleted], userController.followUser)
userRouter.patch('/unfollow-user', [authentication, isNotDeleted], userController.unfollowUser)

userRouter.get('/html', (req, res) => {
//   res.send(`
//     <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Update User Profile</title>
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css">
// </head>
// <body class="bg-gray-100">
//     <div class="container mx-auto mt-10">
//         <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
//             <h2 class="text-2xl font-bold mb-6 text-center">Update Your Profile</h2>
//             <form id="updateForm" enctype="multipart/form-data">
//                 <div class="mb-4">
//                     <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
//                         Name
//                     </label>
//                     <input type="text" id="name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                 </div>
//                 <div class="mb-4">
//                     <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
//                         Email
//                     </label>
//                     <input type="email" id="email" name="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                 </div>
//                 <div class="mb-4">
//                     <label class="block text-gray-700 text-sm font-bold mb-2" for="avatar">
//                         Upload Avatar
//                     </label>
//                     <input type="file" id="avatar" name="file" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                 </div>
//                 <div class="flex items-center justify-between">
//                     <button type="button" id="submitBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
//                         Update Profile
//                     </button>
//                 </div>
//             </form>
//         </div>
//     </div>

//     <script>
//         document.getElementById('submitBtn').addEventListener('click', async () => {
//             const form = document.getElementById('updateForm');
//             const formData = new FormData(form);

//             // Replace with your actual token
//             const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldGhhbmhoaWVwNDMwQGdtYWlsLmNvbSIsImFjY291bnRfcm9sZSI6InVzZXIiLCJpYXQiOjE3MjkwODk5OTEsImV4cCI6MTcyOTA5MDg5MX0.Uv2m3W8Z4wygAcDk_nKtQxLtPJ-auUnATR4noiDXYws';

//             try {
//                 const response = await fetch('http://localhost:8080/user/update-avatar', {
//                     method: 'PATCH',
//                     headers: {
//                         'Authorization': \`Bearer \${token}\`   
//                     },
//                     body: formData
//                 });
//                 if (response.ok) {
//                     alert('Profile updated successfully');
//                 } else {
//                     alert('Failed to update profile');
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 alert('An error occurred');
//             }
//         });
//     </script>
// </body>
// </html>
//   `);
res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Post with Axios</title>
</head>
<body>
    <h1>Create New Post</h1>
    <form id="createPostForm">
        <!-- Product Information -->
        <fieldset>
            <legend>Product Details</legend>

            <label for="name">Product Name:</label>
            <input type="text" id="name" name="product[name]" required>

            <label for="description">Description:</label>
            <textarea id="description" name="product[description]" rows="4" required></textarea>

            <label for="price">Price:</label>
            <input type="number" id="price" name="product[price]" required>

            <label for="condition">Condition:</label>
            <select id="condition" name="product[condition]" required>
                <option value="new">New</option>
                <option value="used">Used</option>
            </select>

            <label for="categoryId">Category:</label>
            <input type="text" id="categoryId" name="product[categoryId]" required>

            <label for="images">Upload Images:</label>
            <input type="file" id="images" name="files" multiple accept="image/*">
        </fieldset>

        <!-- Attributes (Object) -->
        <fieldset>
            <legend>Attributes</legend>

            <label for="color">Color:</label>
            <input type="text" id="color" name="attributes[color]" required>

            <label for="size">Size:</label>
            <input type="text" id="size" name="attributes[size]" required>
        </fieldset>

        <!-- Post Information -->
        <fieldset>
            <legend>Post Details</legend>

            <label for="location">Location:</label>
            <input type="text" id="location" name="location" required>

            <label for="isDraft">Is Draft:</label>
            <input type="checkbox" id="isDraft" name="isDraft">

            <input type="hidden" name="draft_product" value="">
        </fieldset>

        <button type="submit">Submit</button>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script>
        document.getElementById('createPostForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const form = document.getElementById('createPostForm');
            const formData = new FormData(form);
            
            // Set isDraft checkbox as 'true' or 'false'
            const isDraft = document.getElementById('isDraft').checked;
            formData.set('isDraft', isDraft ? 'true' : 'false');

            // Send the data with Axios
            axios.post('/user/post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Success:', response.data);
                alert('Post created successfully!');
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
                alert('Failed to create post.');
            });
        });
    </script>
</body>
</html>
`)
});

export default userRouter;
