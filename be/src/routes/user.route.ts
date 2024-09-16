import express from "express";
import userController from "../controllers/user.controller";
import Multer from '../utils/multer';
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";

const userRouter = express.Router();

userRouter.patch('/update',[authentication, isNotDeleted], userController.updateUser);
userRouter.patch('/update-avatar',[authentication, isNotDeleted, Multer.getUpload().array('files')], userController.updateAvatar);



userRouter.get('/html', (req, res) => {
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update User Profile</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-10">
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold mb-6 text-center">Update Your Profile</h2>
            <form id="updateForm" enctype="multipart/form-data">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                        Name
                    </label>
                    <input type="text" id="name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                        Email
                    </label>
                    <input type="email" id="email" name="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="avatar">
                        Upload Avatar
                    </label>
                    <input type="file" id="avatar" name="files" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="flex items-center justify-between">
                    <button type="button" id="submitBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Update Profile
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        document.getElementById('submitBtn').addEventListener('click', async () => {
            const form = document.getElementById('updateForm');
            const formData = new FormData(form);

            // Replace with your actual token
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldGhhbmhoaWVwNDMwQGdtYWlsLmNvbSIsImlhdCI6MTcyNjUwNjQ1NSwiZXhwIjoxNzI2NTA3MzU1fQ.iqiGat4CcGsFh3HN9koPZTAV7iV3XKriUzFnWhSCrDE';

            try {
                const response = await fetch('http://localhost:8080/user/update-avatar', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': \`Bearer \${token}\`   
                    },
                    body: formData
                });
                if (response.ok) {
                    alert('Profile updated successfully');
                } else {
                    alert('Failed to update profile');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred');
            }
        });
    </script>
</body>
</html>
  `);
});

export default userRouter;
