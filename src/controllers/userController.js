import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"});

export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join";
    // 비번확인때 맞지 않으면 오류
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        });
    }
    // exists메소드로 username or email 이미 존재하는 경우 errorMessage
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username/email is already taken.",
        });
    }
    // try과정에서 400 에러가 발생할경우 에러메시지
    try {
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};

export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    // User에서 username과, socialOnly false를 찾는다
    const user = await User.findOne({ username, socialOnly: false });
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    // bcrypt.compare를 이용해서 form의 패스워드와 , user정보의 해싱된 패스워드 비교
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password",
        });
    }
    // 세션에 정보를 저장한다
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

// 깃허브 로그인
export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString(); // toString을 이용해서 객체의 내용들을 문자열로 리턴
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
    // 로그인을 시도하고 유저가 깃허브로 로그인 허용을 하게 되면 코드를 리턴해줌
};

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code, // 깃허브가 주는 코드(주소에서 받음) code="blabla"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        // fetch로 코드가 들어가있는데 finalUrl 통해 서버에 POST(요청)한다
        // 요청해서 받아온 객체를 json()을 이용해서 json형태로 변환
        await fetch(finalUrl, {
            method: "POST",
            headers: { // 요청헤더
                Accept: "application/json", 
            },
        })
    ).json();
    console.log(tokenRequest)
    
    // 토큰이 들어있는 객체에서 토큰을 이용해서 api서버에 정보 요청
    if ("access_token" in tokenRequest) {
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: { // 요청헤더 설정 
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) { // 깃허브 이메일이 primary,verified 둘중 하나라도 false 일 경우
            // set notification
            return res.redirect("/login");
        }
        let user = await User.findOne({email: emailObj.email});
        if (!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
};
export const postEdit = async (req, res) => {
    // console.log(req.session)
    // console.log(req.body)
    // 정보 가져오기
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } = req;

    // 가져와서 findByIdAndUpdate메소드로 업데이트
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            avatarUrl: file ? file.path : avatarUrl,
            name,
            email,
            username,
            location,
        },
        { new: true } // 업데이트된 데이터를 return
    );
    //세션에도 저장
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle: "Change Password"});
};
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: {_id},
        },
        body: {oldPassword, newPassword, newPasswordConfirmation},
    } = req;
    const user = await User.findById(_id);
    // 
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect",
        });
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The password does not match the confirmation",
        });
    } 
    user.password = newPassword;
    await user.save();
    return res.redirect("/users/logout");
};

// 유저 프로필 정보
export const see = async(req, res) => {
    const { id } = req.params;
    // 유저의 정보를 찾고 거기에 populate()을 이용해서 videos의 정보를 불러온다
    const user = await User.findById(id).populate("videos")
    console.log(user);
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found" });
    }
    
    // video의 owner의 objectId가 URL에 있는 params id와 같은것을 찾는다
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    });
}
