# recorder

♫♪ |̲̅̅●̲̅̅|̲̅̅=̲̅̅|̲̅̅●̲̅̅| ♫♪ Thin ORM for CouchDB on top of Nano

---

    import recorder from "recorder";

    let UserSchema = new recorder.Schema({
      firstName: String,
      lastName: String,
      birthDate: { type: Date, default: Date.now }
    });

    UserSchema.method("fullName", () => {
      return `${this.firstName} ${this.lastName}`;
    });

    let User = recorder.model("User", UserSchema);

    let me = new User({
      firstName: "Benoit",
      lastName: "Charbonnier"
    });

    me.save((error, savedMe) => {
      console.log(`Hello, I am ${savedMe.fullname()}`);
    })
