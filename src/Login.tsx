import { useEffect, useState } from "react";
import DotGrid from "./components/reactbits/DotGrid";
import { Input } from "./components/ui/input";
import { Field, FieldLabel } from "./components/ui/field";
import { Button } from "./components/ui/button";
import DecryptedText from "./components/reactbits/DecryptedText";
import Aurora from "./components/reactbits/Aurora";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
  logIn,
  signUp,
  signUpUpdateTable,
  updatePrefs,
} from "./services/appwriteServices";
import { useNavigate } from "react-router-dom";
import { account } from "./lib/appwrite";
import { EyeIcon } from "./components/ui/eye-icon";
import { EyeOffIcon } from "./components/ui/eye-off-icon";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "./components/ui/input-group";

function Login() {

  // Logo special characters
  const logo = "{_}";

  // Input fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Input fields valid state
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [nameInvalid, setNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);

  // Appwrite error logs
  const [appwriteError, setAppwriteError] = useState(0);
  const appwriteErrorMessages = [
    "is an invalid email.",
    "must be at least 8 characters.",
    "is taken.",
    "may be incorrect.",
  ];

  // Login/signup tab
  const [activeTab, setActiveTab] = useState("login");

  // Router navigation
  let navigate = useNavigate();

  // If user is logged in then will just route to homepage
  useEffect(() => {
    const check = async () => {
      const user = await account.get();

      if (!!user) {
        navigate("/");
      }
    };

    check();
  }, []);

  // Debug state 
  const [debug, setDebug] = useState(false);

  // Logs user in via appwrite session
  const handleLogInBackend = async () => {
    try {

      const response = await logIn(email, password);

      // Store essential data
      localStorage.setItem("userid", response.userId);
      localStorage.setItem("sessionid", response.$id);

      // Will trigger navbar tab update
      window.dispatchEvent(new Event("auth-changed"));

      // Route to homepage
      navigate("/");
    } catch (error: any) {
      // Catch common errors
      if (
        error.message ===
        "Invalid `email` param: Value must be a valid email address"
      ) {
        setAppwriteError(1);
        setEmailInvalid(true);
      } else if (
        error.message.includes(
          "Invalid `password` param: Password must be between 8 and 256 characters long.",
        )
      ) {
        setAppwriteError(2);
        setPasswordInvalid(true);
      } else if (
        error.message.includes(
          "Invalid credentials. Please check the email and password",
        )
      ) {
        setAppwriteError(4);
        setEmailInvalid(true);
        setPasswordInvalid(true);
      }

      console.log("Error [Login.tsx]: Error logging in");
      console.log(error.message);
    }
  };

  // Frontend login checks
  const handleLogIn = async () => {
    // Logic Checks
    const fields = [
      { value: email, setInvalid: setEmailInvalid },
      { value: password, setInvalid: setPasswordInvalid },
    ];

    let hasEmptyField = false;

    // Loops through all fields to check if empty --> show error if true
    fields.forEach(({ value, setInvalid }) => {
      if (!value.trim()) {
        setInvalid(true);
        hasEmptyField = true;
      }
    });

    // Makes sure all fields are entered
    if (hasEmptyField) {
      return;
    }

    // Log in with backend
    handleLogInBackend();
  };

  // Signs user up via appwrite
  const handleSignUpBackend = async () => {
    try {
      const response = await signUp(username, password, email);

      return response;
    } catch (error: any) {
      // Catches common errors
      if (
        error.message ===
        "Invalid `email` param: Value must be a valid email address"
      ) {
        setAppwriteError(1);
        setEmailInvalid(true);
      } else if (
        error.message.includes(
          "Invalid `password` param: Password must be between 8 and 265 characters long",
        )
      ) {
        setAppwriteError(2);
        setPasswordInvalid(true);
      } else if (
        error.message ===
        "A user with the same id, email, or phone already exists in this project."
      ) {
        setAppwriteError(3);
        setUsernameInvalid(true);
      }
      console.log("Error [Login.tsx]: Error signing up");
      console.log(error.message);
    }
  };

  // Frontend sign up checks
  const handleSignUp = async () => {
    // Logic Checks
    const fields = [
      { value: username, setInvalid: setUsernameInvalid },
      { value: password, setInvalid: setPasswordInvalid },
      { value: name, setInvalid: setNameInvalid },
      { value: email, setInvalid: setEmailInvalid },
    ];

    let hasEmptyField = false;

    // Loops through all fields to check if empty --> show error if true
    fields.forEach(({ value, setInvalid }) => {
      if (!value.trim()) {
        setInvalid(true);
        hasEmptyField = true;
      }
    });

    // Makes sure all fields are entered
    if (hasEmptyField) {
      return;
    }

    // Signs up with backend
    const response = await handleSignUpBackend();
    if (response) {
      // Will now login with response data
      await signUpUpdateTable(username, name);
      await handleLogInBackend();
      await updatePrefs(name);
    }
  };

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Reuseable input field component
  const formInput = ({ input, index }: formInputProps) => {

    // Input fields | Input setters | Input validity states | Input validity state setters
    const fields = [email, password, username, name];
    const setFields = [setEmail, setPassword, setUsername, setName];
    const fieldInvalids = [emailInvalid,passwordInvalid,usernameInvalid,nameInvalid];
    const setFieldInvalids = [setEmailInvalid,setPasswordInvalid,setUsernameInvalid,setNameInvalid];

    return (
      <Field>
        <FieldLabel
          htmlFor={`input-field-${input.toLowerCase()}`}
          className={` transition-all duration-350 ${fieldInvalids[index] && "text-red-500"} `}
        >
          {input + " "}
          {index === 0 && appwriteError === 1
            ? appwriteErrorMessages[0]
            : index === 1 && appwriteError === 2
              ? appwriteErrorMessages[1]
              : index === 2 && appwriteError === 3
                ? appwriteErrorMessages[2]
                : (index === 0 || index === 1) && appwriteError === 4
                  ? appwriteErrorMessages[3]
                  : fieldInvalids[index] && "is required."}
        </FieldLabel>

        {index === 1 && input === "Password" ? (
          <InputGroup>
            <InputGroupInput
              id={`input-field-password`}
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder={`Enter your password`}
              aria-invalid={passwordInvalid}
              onChange={(e) => {
                if (appwriteError === 4) {
                  setPasswordInvalid(false);
                }
                setAppwriteError(0);
                setPasswordInvalid(false);
                setPassword(e.target.value);
              }}
              className={` transition-all duration-350 ${passwordInvalid ? "border-red-500 focus-visible:ring-red-500" : ""} `}
            ></InputGroupInput>

            <InputGroupAddon align="inline-end">
              {showPassword ? (
                <EyeIcon
                  size={18}
                  className="cursor-pointer"
                  onClick={() => {
                    setShowPassword(false);
                  }}
                />
              ) : (
                <EyeOffIcon
                  size={18}
                  className="cursor-pointer"
                  onClick={() => {
                    setShowPassword(true);
                  }}
                />
              )}
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <Input
            id={`input-field-${input.toLowerCase()}`}
            type={input === "Password" && !showPassword ? "password" : "text"}
            value={fields[index]}
            placeholder={`Enter your ${input.toLowerCase()}`}
            aria-invalid={fieldInvalids[index]}
            onChange={(e) => {
              if (appwriteError === 4) {
                setEmailInvalid(false);
                setPasswordInvalid(false);
              }
              setAppwriteError(0);
              setFieldInvalids[index](false);
              setFields[index](e.target.value);
            }}
            className={` transition-all duration-350 ${fieldInvalids[index] ? "border-red-500 focus-visible:ring-red-500" : ""} `}
          />
        )}
      </Field>
    );
  };

  // Resets all form data
  const clearForm = () => {
    setUsernameInvalid(false);
    setPasswordInvalid(false);
    setNameInvalid(false);
    setEmailInvalid(false);
    setUsername("");
    setPassword("");
    setName("");
    setEmail("");
    setAppwriteError(0);
  };

  return (
    <div className="flex w-full h-full items-center justify-center flex-col ">
      <div className="absolute inset-0 -z-10">
        {!debug && (
          <DotGrid
            dotSize={1}
            gap={10}
            baseColor="#27B1FC"
            activeColor="#8B5CF6"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
            speedTrigger={200}
          />
        )}
      </div>

      {/* <Button
        className="absolute top-2.5 left-2.5"
        onClick={() => {
          setDebug(!debug);
        }}
      >
        Debug {debug ? "on" : "off"}
      </Button> */}

      <div className="rounded-2xl flex w-[40%] h-[80%] bg-black/10 backdrop-blur-xs shadow-2xl flex-col overflow-hidden">
        <div className="flex flex-1/5 justify-center items-center">
          <div className="absolute inset-0 -z-10 h-[50%]">
            {!debug && (
              <Aurora
                colorStops={["#27B1FC", "#8B5CF6", "#5227FF"]}
                blend={1}
                amplitude={1.0}
                speed={0.75}
              />
            )}
          </div>
          <p className="text-[24px] font-bold">
            <span className="text-[#27B1FC]">{logo[0]} </span>
            NODE
            <span className="text-[#27B1FC]">{logo[1]}</span>
            POINT
            <span className="text-[#27B1FC]">
              {logo[1]} {logo[2]}
            </span>
          </p>
        </div>

        <div className="flex p-4 items-center justify-center">
          <div className="text-[24px] font-bold">
            <DecryptedText
              text="Reconnect to the "
              animateOn="view"
              revealDirection="start"
              sequential
              useOriginalCharsOnly={false}
            />
            <DecryptedText
              className="text-[#27B1FC]"
              text="Node"
              animateOn="view"
              revealDirection="start"
              sequential
              useOriginalCharsOnly={false}
              speed={200}
            />
          </div>
        </div>

        <div
          className={`
              ${activeTab === "login" ? "min-h-80" : "min-h-130"}
              transition-all duration-600 ease-initial
              flex justify-center overflow-hidden
            `}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="login"
            className="mt-8 w-[60%] h-fit"
          >
            <TabsList className="hidden">
              <TabsTrigger value="login"></TabsTrigger>
              <TabsTrigger value="signup"></TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="flex flex-col gap-4">
                {formInput({ input: "Email", index: 0 })}

                {formInput({ input: "Password", index: 1 })}

                <Button
                  className="w-[40%] self-center transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 bg-[#27B1FC]/50 hover:bg-[#27B1FC]/45 "
                  onClick={handleLogIn}
                >
                  Log In
                </Button>

                <div>
                  <p className="text-[12px] text-center">
                    Don't have an account?{" "}
                    <span
                      className="text-[#27B1FC] cursor-pointer hover:underline"
                      onClick={() => {
                        clearForm();
                        setShowPassword(true);
                        setActiveTab("signup");
                      }}
                    >
                      Sign Up Now
                    </span>
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="flex flex-col gap-4">
                {formInput({ input: "Email", index: 0 })}

                {formInput({ input: "Password", index: 1 })}

                {formInput({ input: "Username", index: 2 })}

                {formInput({ input: "Name", index: 3 })}

                <Button
                  className="w-[40%] self-center transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 bg-[#27B1FC]/50 hover:bg-[#27B1FC]/45 "
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>

                <div>
                  <p className="text-[12px] text-center">
                    Already have an account?{" "}
                    <span
                      className="text-[#27B1FC] cursor-pointer hover:underline"
                      onClick={() => {
                        clearForm();
                        setShowPassword(false);
                        setActiveTab("login");
                      }}
                    >
                      Log In Now
                    </span>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Login;
