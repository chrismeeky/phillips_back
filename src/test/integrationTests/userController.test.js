import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import app from "../../index";
import { User } from "../../models";
import { UserController } from "../../controllers";

chai.use(chaiHttp);
const { expect } = chai;
const resetData = async () => {
  await User.deleteMany();
};

resetData();

describe("Integration tests for the user controller", () => {
  describe("Test general error handling and welcome message", () => {
    it('should send a "You are on Phillips NIG LTD but it looks like The page you are looking for does not exist', async () => {
      const response = await chai.request(app).get("/api/v1/some/funny/url");
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.equal(
        "You are on Phillips NIG LTD but it looks like The page you are looking for does not exist"
      );
    });
  });
  describe("Test to pre-register a user", () => {
    let stubCreateTokenAndSendEmail;
    afterEach(() => {
      if (stubCreateTokenAndSendEmail.restore)
        stubCreateTokenAndSendEmail.restore();
    });
    it("should create a user and send email for verification", async () => {
      const userDetails = {
        username: "jjkjghjhh",
        password: "password",
        email: "jjkjghjhh@wemail.com",
        firstName: "John",
        lastName: "Doe",
      };
      stubCreateTokenAndSendEmail = sinon
        .stub(UserController, "createTokenAndSendEmail")
        .returns(true);
      const response = await chai
        .request(app)
        .post("/api/v1/auth/signup")
        .send(userDetails);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.equal(
        "An email has been sent to your " +
          "email address. Please check your email to complete " +
          "your registration"
      );
      expect(response.body).to.have.property("success");
      expect(response.body.success).to.be.equal(true);
      stubCreateTokenAndSendEmail.restore();
    });
    it(
      "should tell the user to re-register when confirmation " +
        "email is not sent",
      async () => {
        const userDetails = {
          username: "iooi",
          password: "password",
          email: "ewewr",
          firstName: "Johns",
          lastName: "Does",
        };
        stubCreateTokenAndSendEmail = sinon
          .stub(UserController, "createTokenAndSendEmail")
          .returns(false);
        const response = await chai
          .request(app)
          .post("/api/v1/auth/signup")
          .send(userDetails);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal(
          "Your registration could not be completed. Please try again"
        );
        expect(response.body).to.have.property("success");
        expect(response.body.success).to.be.equal(false);
      }
    );
    it("should return an error when any user details is not given", async () => {
      const userDetails = {
        username: "JohnDoe",
        password: "password",
        email: "johndoe@wemail.com",
        firstName: "John",
      };
      const response = await chai
        .request(app)
        .post("/api/v1/auth/signup")
        .send(userDetails);
      console.log(response.body);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.equal(
        "User validation failed: lastName: Path `lastName` is required."
      );
    });
  });
  describe("Test login a user", () => {
    it("should log a user in when valid details are given", async () => {
      await User.updateOne(
        { email: "jjkjghjhh@wemail.com" },
        { $set: { isVerified: true } }
      );
      const response = await chai.request(app).post("/api/v1/auth/login").send({
        email: "jjkjghjhh@wemail.com",
        password: "password",
      });
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.equal("Login successful");
      expect(response.body).to.have.property("success");
      expect(response.body.success).to.equal(true);
    });
    it("should return client error when user details is missing", async () => {
      const response = await chai.request(app).post("/api/v1/auth/login").send({
        email: "johnbvfdse@wemail.com",
      });
      expect(response.body).to.have.property("success");
      expect(response.body.success).to.equal(false);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.equal(
        "Invalid request. 'password' field is required"
      );
    });
  });
});
