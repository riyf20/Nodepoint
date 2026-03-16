import React, { useEffect, useRef, useState } from "react";
import { images } from "./constants/images";
import { Field, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { checkUsernameTaken, deletePicture, getLivePicture, 
  getUser, updateEmail, updateName, updateNameTable, updatePassword, 
  updateUsername, updateUsernameTable, uploadMedia as uploadProfilePic, 
  uploadProfilePicTable,
} from "./services/appwriteServices";
import { Button } from "./components/ui/button";
import { UserPenIcon, type UserPenHandle,
} from "./components/ui/animatedIcons/user-pen-icon";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldUserIcon, type ShieldUserHandle,
} from "./components/ui/animatedIcons/shield-user-icon";
import { Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle,
} from "./components/ui/dialog";
import { Spinner } from "./components/ui/spinner";

// Route: "/account"
// Account page: Quick overview of user's information, can easily change and update critical information.
function Account() {
  // Need for verifying changes
  const userId = localStorage.getItem("userid");

  // Input Fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [prevPassword, setPrevPassword] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Validity state for input fields
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [nameInvalid, setNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [newPasswordInvalid, setNewPasswordInvalid] = useState(false);

  // Validity state for security password
  const [confirmPasswordInvalid, setConfirmPasswordInvalid] = useState(false);

  // User's profile picture
  const [profilePic, setProfilePic] = useState(false);
  const [profilePicLink, setProfilePicLink] = useState("");

  // Dialog/Model for user confirmation
  const [dialogOpen, setDialogOpen] = useState(false);

  // Loading state when uploading
  const [loading, setLoading] = useState(false);

  // Changes model information based on user selection
  const [modelMode, setModelMode] = useState("");

  // Animated icon ref
  const shieldUserRef = useRef<ShieldUserHandle>(null);

  // File picker ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Original object to hold all values
  const [original, setOriginal] = useState<originalData | null>(null);

  // Quick fetches user data
  const fetchUserDetails = async () => {
    try {
      const response = await getUser();

      // Checks for stored profile picture data (should be set from Navbar.tsx)
      let profile =
        localStorage.getItem("profilePicture") === "true" ? true : false;
      let profileId = localStorage.getItem("profilePictureId") ?? "";

      let storedUsername = localStorage.getItem("username");

      // Store all orginal data
      let originalData = {
        username: storedUsername ?? "",
        email: response.email,
        name: response.prefs.fullName,
        profilePic: profile,
        profilePicId: profileId,
      };

      setOriginal(originalData);

      setUsername(storedUsername ?? "");
      setEmail(response.email);
      setName(response.prefs.fullName);
      setProfilePic(profile);

      // Will get live link if user has custom picture
      if (profile) {
        let link = getLivePicture(profileId);
        setProfilePicLink(link);
      }
    } catch (error: any) {
      console.log("Error [Account.tsx]: Error fetching user");
      console.log(error.message);
    }
  };

  // Fetch details
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Holds new profile picture and preview
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Image picker handler
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const selectedFile = fileList[0];

    // Store the selected file and preview
    setNewImage(selectedFile);
    setNewImagePreview(URL.createObjectURL(selectedFile));

    // Open the model in image mode
    setModelMode("image");
    setDialogOpen(true);

    // Resets the picker selection (this allows you to selected same image if you canceled previously)
    e.target.value = "";
  };

  // Reused input field component
  const inputfields = ({ input, index }: inputfieldsProps) => {
    // Update username [Name field in appwrite]
    const saveUsername = async () => {
      try {
        // Check if new username is valid (not taken)
        const response = await checkUsernameTaken(username);

        if (response) {
          // Will return as true if new username is taken
          setUsernameInvalid(true);
          return;
        } else {
          try {
            // Change username in Appwrite Auth and Users table
            await updateUsername(username);
            await updateUsernameTable(userId!, username);

            // Reset fields
            setEditing(false);

            // Update original object
            let altered = {
              username: username,
              email: original!.email,
              name: original!.name,
              profilePic: original!.profilePic,
              profilePicId: original!.profilePicId,
            };
            setOriginal(altered);
          } catch (error: any) {
            console.log("Error [Account.tsx]: Updating username");
            console.log(error.message);
          }
        }
      } catch (error: any) {
        console.log("Error [Account.tsx]: Checking username");
        console.log(error.message);
      }
    };

    // Update full name (stored within user prefs)
    const saveName = async () => {
      try {
        // Change username in Appwrite Auth and Users table
        await updateName(name);
        await updateNameTable(userId!, name);

        // Reset fields
        setEditing(false);

        // Update orginal object
        let altered = {
          username: original!.username,
          email: original!.email,
          name: name,
          profilePic: original!.profilePic,
          profilePicId: original!.profilePicId,
        };
        setOriginal(altered);
      } catch (error: any) {
        console.log("Error [Account.tsx]: Updating name");
        console.log(error.message);
      }
    };

    // Check email input
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Input fields | Input setters | Input validity states | Input validity state setters
    const fields = [username, name, email, newPassword];
    const setFields = [setUsername, setName, setEmail, setNewPassword];
    const fieldInvalids = [ usernameInvalid, nameInvalid, emailInvalid, newPasswordInvalid ];
    const setFieldInvalids = [ setUsernameInvalid, setNameInvalid, setEmailInvalid, setNewPasswordInvalid ];

    // Confirm action functions
    const submitAction = [saveUsername, saveName];

    // Index compatible original data
    const originalData = [original?.username, original?.name, original?.email];

    // Editing state
    const [editing, setEditing] = useState(false);

    // Will reset fields if the model is closed
    useEffect(() => {
      if (index === 2 && !dialogOpen) {
        setFields[index](originalData[index]!);
        setEditing(false);
      } else if (index === 3 && !dialogOpen) {
        setFields[index]("");
        setEditing(false);
      }
    }, [dialogOpen]);

    // Animated icon ref
    const userPenRef = useRef<UserPenHandle>(null);

    return (
      <div className="border border-[#27B1FC]/30 rounded-2xl p-4 shadow-2xl bg-[#1E1E20] transition-all duration-250 transform hover:scale-101">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{input}</p>
            <p className="text-sm text-muted-foreground mt-1 ml-2">
              {originalData[index]} {index === 3 && "********"}
            </p>
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: editing ? 0 : 1, scale: editing ? 0.95 : 1 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={` ${editing ? "pointer-events-none" : ""}`}
          >
            <Button
              onMouseEnter={() => {
                userPenRef.current?.startAnimation();
              }}
              onMouseLeave={() => {
                userPenRef.current?.stopAnimation();
              }}
              className={`bg-[#27B1FC]/60 hover:bg-[#27B1FC]/50 transition-all duration-300 `}
              onClick={() => {
                setEditing(true);
              }}
            >
              <UserPenIcon size={18} ref={userPenRef} />
              Edit
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{
                height: {
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                },
              }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  delay: 0.15,
                  y: { type: "spring", stiffness: 180, damping: 18 },
                  opacity: { duration: 0.2 },
                }}
              >
                <Field className="mt-4">
                  <FieldLabel
                    className={` transition-all duration-350 ${fieldInvalids[index] && "text-red-500"} `}
                  >
                    {fieldInvalids[index]
                      ? index === 0
                        ? "Username is taken."
                        : index === 2
                          ? "Invalid email format."
                          : `Invalid ${input}.`
                      : `New ${input}`}
                  </FieldLabel>

                  <div className="flex flex-row gap-4">
                    <Input
                      id={`input-field-${input.toLowerCase()}`}
                      type={"text"}
                      value={fields[index]}
                      placeholder={`Your ${index === 3 ? "new" : ""} ${input.toLowerCase()}`}
                      onChange={(e) => {
                        setFieldInvalids[index](false);
                        setFields[index](e.target.value);
                      }}
                      className={` transition-all duration-350 ${fieldInvalids[index] ? "border-red-500 focus-visible:ring-red-500" : ""} `}
                    />

                    <Button
                      className="bg-green-800 hover:bg-green-900"
                      disabled={
                        fields[index] === originalData[index] ||
                        !fields[index].length
                      }
                      onClick={() => {
                        if (index === 2) {
                          if (!isValidEmail(email)) {
                            setEmailInvalid(true);
                            return;
                          }

                          setModelMode("Email");
                          setDialogOpen(true);
                        }
                        if (index === 3) {
                          setModelMode("Password");
                          setDialogOpen(true);
                        } else {
                          submitAction[index]();
                        }
                      }}
                    >
                      {index >= 2 ? "Update" : "Save"}
                    </Button>

                    <Button
                      className="bg-red-800 hover:bg-red-900"
                      onClick={() => {
                        setEditing(false);
                        setFieldInvalids[index](false);
                        setFields[index](originalData[index]!);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Field>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // TO DO: Allow users to reset back to default picture

  // Models confirm function
  const handleModelConfirm = async () => {
    // Image model
    if (modelMode === "image") {
      setLoading(true);

      // If user already had an image [delete before uploading new image]
      if (original?.profilePic) {
        try {
          await deletePicture(original.profilePicId);
        } catch (error: any) {
          console.log("Error uploading profile picture model");
          console.log(error.message);
        }
      }

      // Upload new profile picture
      try {
        // Upload to image bucket and store the id
        const response = await uploadProfilePic(newImage!);
        await uploadProfilePicTable(userId!, response.$id);

        // Update original object
        let altered = {
          username: original!.username,
          email: original!.email,
          name: original!.name,
          profilePic: true,
          profilePicId: response.$id,
        };

        setOriginal(altered);

        // Grab new image link
        let link = getLivePicture(response.$id);
        setProfilePicLink(link);

        // Update local storage variables
        localStorage.setItem("profilePictureId", response.$id);
        localStorage.setItem("profilePicture", "true");

        // Dispatch event triggers navbar to use updated picture
        window.dispatchEvent(
          new CustomEvent("profile-picture-updated", {
            detail: { id: response.$id },
          }),
        );

        // Reset image variables
        setNewImage(null);
        setNewImagePreview(null);

        // Reset model variables
        setModelMode("");
        setDialogOpen(false);
      } catch (error: any) {
        console.log("Error uploading profile picture model");
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Email or password model
      try {
        setLoading(true);

        // Will check which api call to make
        if (modelMode === "Email") {
          await updateEmail(email, prevPassword);
        } else {
          await updatePassword(prevPassword, newPassword);
        }

        // Resets model information
        setModelMode("");
        setPrevPassword("");
        setConfirmPasswordInvalid(false);

        // Update original object
        let altered = {
          username: original!.username,
          email: email,
          name: original!.name,
          profilePic: original!.profilePic,
          profilePicId: original!.profilePicId,
        };
        setOriginal(altered);
      } catch (error: any) {
        setConfirmPasswordInvalid(true);
        if (error.message.includes("Invalid credentials")) {
          return;
        }
        console.log("Error updating model");
        console.log(error.message);
      } finally {
        setLoading(false);
        setDialogOpen(false);
      }
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center ">
      <div className=" w-[50%] mt-6 items-center justify-center">
        <div className="flex flex-row">
          <p className="text-[#27B1FC] font-bold text-[24px]">Your Account</p>
        </div>

        <div className="border border-[#27B1FC]/30 transition-all duration-250 transform hover:border-[#27B1FC]/60 mt-4 p-4 flex flex-col gap-6 rounded-2xl bg-[#171718]">
          <div className="flex justify-center">
            <div
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="absolute w-36 h-36 rounded-full object-cover hover:bg-black/50 cursor-pointer flex items-center justify-center transition-all duration-300 text-transparent hover:text-white"
            >
              <p className="text-sm">Click to change</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              id="imageUpload"
              accept="image/*"
              multiple
              onChange={handleFiles}
              style={{ display: "none" }}
            />

            <img
              src={profilePic ? profilePicLink : images.profile}
              alt={`cover_pic`}
              className="w-36 h-36 rounded-full object-cover shadow-2xl"
            />
          </div>

          <div className="flex flex-col px-4 gap-6">
            {inputfields({ input: "Username", index: 0 })}

            {inputfields({ input: "Name", index: 1 })}

            {inputfields({ input: "Email", index: 2 })}

            {inputfields({ input: "Password", index: 3 })}
          </div>
        </div>
      </div>

      {/* Dialog | Model */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-[#171718] border-none"
          onMouseEnter={() => {
            shieldUserRef.current?.startAnimation();
          }}
          onMouseLeave={() => {
            shieldUserRef.current?.stopAnimation();
          }}
        >
          <DialogHeader>
            <DialogTitle
              className={`flex flex-row items-center gap-2 ${confirmPasswordInvalid ? "text-red-500 focus-visible:ring-red-500" : ""} `}
            >
              {modelMode === "image" ? (
                `Image: ${newImage?.name}`
              ) : (
                <>
                  <ShieldUserIcon ref={shieldUserRef} />
                  {confirmPasswordInvalid
                    ? "Password Incorrect."
                    : "Confirm Password"}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {modelMode === "image" ? (
                <img
                  src={newImagePreview!}
                  alt={`Preview image - dialog`}
                  className="w-96 h-w-96 object-cover rounded-lg mt-2"
                />
              ) : (
                "For security reasons, please enter your password to confirm your changes."
              )}
            </DialogDescription>
          </DialogHeader>

          {modelMode !== "image" && (
            <div className="mt-4">
              <Input
                type="password"
                value={prevPassword}
                onChange={(e) => {
                  setPrevPassword(e.target.value);
                  setConfirmPasswordInvalid(false);
                }}
                placeholder="Enter your current password"
                className={` ${confirmPasswordInvalid ? "border-red-500 focus-visible:ring-red-500" : ""} `}
              />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              disabled={
                (modelMode !== "image" && prevPassword.length === 0) || loading
              }
              className="bg-green-800 hover:bg-green-900"
              // TO DO: Error handling on this, what is email is not valid or password is wrong
              onClick={handleModelConfirm}
            >
              {loading ? (
                <>
                  <Spinner />
                  Processing
                </>
              ) : (
                "Confirm"
              )}
            </Button>
            <Button
              disabled={loading}
              className="bg-red-800 hover:bg-red-900"
              onClick={() => {
                if (modelMode === "image") {
                  setNewImage(null);
                  setNewImagePreview(null);
                } else {
                  setPrevPassword("");
                  setConfirmPasswordInvalid(false);
                }
                setModelMode("");
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Account;
