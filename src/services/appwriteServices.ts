import { ID, Query } from "appwrite";
import { account, database, storage } from "../lib/appwrite";


// [Login | Signup | Auth]
export const signUp = async (username: string, password: string, email: string) => {

    // Username will be appwrite name (allowing for users to change it later)
    // Actual name will be in preferences (allowing for mutation as well)

    return await account.create({
        userId: username,
        email: email,
        password: password,
        name: username,
    })
}

export const signUpUpdateTable = async(userid:string, name:string) => {

    return await database.createDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        documentId: userid,
        data: {
            "ProfilePic": false,
            "Username": userid,
            "Name": name,
        },
    })
}

export const logIn = async (email: string, password: string) => {

    return await account.createEmailPasswordSession({
        email: email,
        password: password
    })
}

export const logOut = async () => {

    return await account.deleteSession({
        sessionId: 'current'
    })

}


// [User Details]
export const getUser = async () => {
    return await account.get()
}

// Grabs user from the database [users table]
export const getUserTable = async (userid:string) => {
    return await database.getDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        documentId: userid,

    });
}

// Deletes image from bucket
export const deletePicture = async (fileid:string) => {
    return await storage.deleteFile({
        bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
        fileId: fileid
    });
}

// Change user's name [appwrite prefs]
export const updatePrefs = async (newName:string) => {

    return await account.updatePrefs({
        prefs: {
            "fullName": newName,
        }
    });
}

// Checks users table to see if username is taken
export const checkUsernameTaken = async(username:string) => {

    const result = await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        queries: [
            Query.search("Username", username)
        ]
    });

    if(result.total === 0){
        return false
    } else{
        return true
    }
}

export const updateUsername = async (newUsername:string) => {

    return await account.updateName({
        name: newUsername
    });
}

export const updateUsernameTable = async (userId: string, newUsername:string) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        documentId: userId,
        data: {
            "Username": newUsername,
        }, 

    })
}

export const updateName = async (newName:string) => {
    
    const user = await account.get();

    return await account.updatePrefs({
        prefs: {
        ...user.prefs,
        fullName: newName,
        }
    });
}

export const updateNameTable = async (userId: string, newName:string) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        documentId: userId,
        data: {
            "Name": newName,
        }, 

    })
}

export const updatePassword = async (prevPassword: string, newPassword:string) => {


    return await account.updatePassword({
        password: newPassword,
        oldPassword: prevPassword,
    });
}

export const updateEmail = async (email: string, password: string) => {

    return await account.updateEmail({
        email: email,
        password: password,
    });
}

// [All media: Profile Pictures | Post Media]
export const uploadMedia = async (image:File) => {

    return await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        ID.unique(),
        image
    );

}

export const uploadProfilePicTable = async (userId:string, imageId: string) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        documentId: userId,
        data: {
            "ProfilePicId": imageId,
        }, 

    })
}

export const getLivePicture = (fileId: string) => {
  return `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
};

// [Posts]
export const getAllPosts = async () => {

    return await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        queries: [
            Query.orderDesc("$createdAt")
        ]
    })
}

export const submitPost = async (title: string, body:string, userid: string, mediaIds: string[]) => {

    return await database.createDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        documentId: ID.unique(),
        data: {
            "Title": title,
            "Body": body,
            "Userid": userid,
            "Pictures": mediaIds,
        },
    })

}

export const searchPosts = async (userid:string) => {


    return await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        queries: [
            Query.search("Userid", userid)
        ]
    });

}

export const deletePost = async (postId:string) => {

    return await database.deleteDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        documentId: postId,
    })

}

export const fetchSpecificPost = async (postId:string) => {

    return await database.getDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        documentId: postId,

    });

}

export const queryPosts = async (searchQuery:string) => {

    return await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        queries: [
            Query.or([
                Query.search("Title", searchQuery),
                Query.search("Body", searchQuery)
            ]) 
        ]
    });

}

export const updatePostContent = async (postId: string, newTitle: string, newBody: string) => {
    
    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        documentId: postId,
        data: {
            "Title": newTitle,
            "Body": newBody,
        }, 

    })
}

// Post Stats
export const updateUserLikes = async (userId:string, likes: string[]) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        documentId: userId,
        data: {
            "Likes": likes,
        }, 

    })
}

export const updatePostLikes = async (postId:string, likes: number) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        documentId: postId,
        data: {
            "Likes": likes,
        }, 

    })
}

export const updateUserSaves = async (userId:string, saves: string[]) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_USERS_TABLE,
        documentId: userId,
        data: {
            "Saves": saves,
        }, 

    })
}

export const updatePostSaves = async (postId:string, saves: number) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        documentId: postId,
        data: {
            "Saves": saves,
        }, 

    })
}

export const updatePostViews = async (postId: string, views: number) => {
  return await database.updateDocument({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
    documentId: postId,
    data: {
      "Views": views
    }
  })
}

// [Comments]
export const fetchComments = async (postId: string) => {

    return await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_COMMENTS_TABLE,
        queries: [
            Query.search("Postid", postId)
        ]
    });
}

export const searchComments = async (userId: string) => {

    return await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_COMMENTS_TABLE,
        queries: [
            Query.search("Userid", userId)
        ]
    });
}

export const submitComment = async (userId: string, postId: string, body: string) => {

    return await database.createDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_COMMENTS_TABLE,
        documentId: ID.unique(),
        data: {
            "Userid": userId,
            "Postid": postId,
            "Body": body,
        },
    })

}

export const updateCommentPost = async (postId: string, commentIds: string[]) => {
    
    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_POST_TABLE,
        documentId: postId,
        data: {
            "Comments": commentIds,
        }, 

    })
}

export const deleteComment = async (commentId:string) => {

    return await database.deleteDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_COMMENTS_TABLE,
        documentId: commentId,
    })

}

// Search query table
export const checkSearchQuery = async (query: string) => {

    return await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_QUERYS_TABLE,
        queries: [ Query.equal("Query", query) ]
    })
    
}

export const trendingSearchQuerys = async () => {

    return await database.listDocuments({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_QUERYS_TABLE,
        queries: [ Query.orderDesc("Count"), Query.limit(5) ]
    })
    
}

export const addSearchQuery = async (query: string) => {

    return await database.createDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_QUERYS_TABLE,
        documentId: query,
        data: {
            "Query": query,
            "Count": 1,
        },
    })
}

export const updateSearchQuery = async (query: string, newCount: number) => {

    return await database.updateDocument({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        collectionId: import.meta.env.VITE_APPWRITE_DATABASE_QUERYS_TABLE,
        documentId: query,
        data: {
            "Count": newCount
        }
    })
}

