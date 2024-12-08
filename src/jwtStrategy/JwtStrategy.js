const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../model/user-model");
const Supplier = require("../model/supplier-management");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new Strategy(opts, function (jwt_payload, done) {
    User.findOne({
      where: { id: jwt_payload.id, status: true },
    })
      .then((user) => {
        if (!user) {
          return done(null, false);
        }
        return done(null, user, { scope: user.email });
      })
      .catch((e) => {
        return done(e);
      });
  })
);

const authenticateUser = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user info to req.userinfo
    req.userInfo = user.get({ plain: true });

    next();
  })(req, res, next);
};

const authenticateUserConditional = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    return authenticateUser(req, res, next);
  }
  return next();
};

const authenticateSuppliers = async (req, res, next) => {
  const authToken = req.headers["x-auth-token"];
  const supplier =
    authToken &&
    (await Supplier.findOne({
      where: {
        id: authToken,
        status: true,
      },
      attributes: ["id", "email", "name"],
      raw: true, // Returns a plain JavaScript object
    }));

  if (supplier) {
    req.supplier = supplier;
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  authenticateUser,
  authenticateSuppliers,
  authenticateUserConditional,
};
