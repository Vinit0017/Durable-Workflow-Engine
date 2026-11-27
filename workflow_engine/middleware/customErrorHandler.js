class CustomError extends Error{
    constructor(message, status, name){
        super(message);
        this.name = name;
        this.status = status;
    }
}