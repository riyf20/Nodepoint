interface Post {
    $id: string,
    Title: string,
    Body: string,
    Pictures: string[],
    Comments: string[],
    Userid: string,
    Views: number,
    Likes: number,
    Saves: number,
    Featured: boolean,
    $createdAt: string,
    $updatedAt: string,
}

interface Comments {
    $id: string,
    Body: string,
    Userid: string,
    Postid: string,
    $createdAt: string,
    $updatedAt: string,
}

interface HomeCardProps {
    post: Post
    delay: number
    // best liked, best commented, etc.
    best?: number
}

interface PostCardProps {
    post: Post,
    delay: number,
    onDelete: (id: string) => void;
    onFeatureChange: (id:string, featured: boolean) => void;
    totalFeatured: number
}

interface CommentBarProps {
    comment: Comments, 
    index: number,
    delay: number
}

interface originalData {
    username: string;
    email: string;
    name: string;
    profilePic: boolean;
    profilePicId: string;
}

interface inputfieldsProps {
    input: string;
    index: number;
}

interface formInputProps {
    input: string;
    index: number;
}

interface CommentCardProps {
    comment: Comments
    delay: number,
    onDelete: (id: string) => void;
}

interface CoverPhotoProps {
    textScale: string,
}

interface User {
    $id: string,
    Username: string,
    Name: string,
    ProfilePic: boolean,
    ProfilePicId: string,
    Likes: string[],
    Saves: string[],
    Bio: string,
    $createdAt: string,
    $updatedAt: string,
}

interface TrendingUsers {
    user: string;
    score: number;
    posts: number;
    views: number;
    likes: number;
    link: string 
}