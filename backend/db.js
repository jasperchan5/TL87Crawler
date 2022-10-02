import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    date: {
        type: String,
        required: [true, 'id field is required']
    },
    content: {
        type: String,
        required: [true, 'Text field is required']
    },
    replies: {
        type: Array,
        required: [true, 'isDone field is required']
    }
});

const Comment = mongoose.model('comments', CommentSchema);

export default Comment;