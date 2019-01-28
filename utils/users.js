class Users {
    constructor() {
        this.users = []
    }

    addUser(id, name, room) {
        const newUser = { id, name, room };
        this.users = [...this.users, newUser];

        return newUser;
    }

    removeUser (id) {
        const userRemoved = this.getUser(id);

        if (userRemoved) {
          this.users = this.users.filter(user => user !== userRemoved);
        }
    
        return userRemoved;
    }

    getUser (id) {
        const user = this.users.find(user => user.id === id);
                
        return user;
    }

    getUserList (room) {
        return this.users.filter(user => user.room === room).map(user => user.name);
    }
}

module.exports = { Users };
