// server/src/modules/peer/peer.service.js
import User from "../user/user.model.js";

/**
 * Get all students with their connection status relative to the current user.
 * Returns: name, email, course/domain, academicStatus, and connectionStatus.
 */
export const getStudentList = async (currentUserId) => {
    // Fetch the current user to read their connections array
    const currentUser = await User.findById(currentUserId).select("connections");

    if (!currentUser) {
        throw new Error("Current user not found");
    }

    // Build a quick lookup map: peerId -> { status, requestedBy }
    const connectionMap = new Map();
    for (const conn of currentUser.connections || []) {
        connectionMap.set(conn.userId.toString(), {
            status: conn.status,
            requestedBy: conn.requestedBy.toString()
        });
    }

    // Get all students except the current user
    const students = await User.find({
        _id: { $ne: currentUserId },
        role: "student"
    }).select("fullName email course domain academicStatus college");

    // Map each student with their connection status relative to the current user
    const result = students.map((student) => {
        const conn = connectionMap.get(student._id.toString());

        let connectionStatus = "not_connected";

        if (conn) {
            if (conn.status === "connected") {
                connectionStatus = "connected";
            } else if (conn.status === "pending") {
                // Who sent the request?
                connectionStatus =
                    conn.requestedBy === currentUserId.toString()
                        ? "request_sent"
                        : "request_received";
            }
        }

        return {
            _id: student._id,
            fullName: student.fullName,
            email: student.email,
            course: student.course || student.domain || "Student",
            academicStatus: student.academicStatus || "college",
            college: student.college || "",
            connectionStatus
        };
    });

    return result;
};

/**
 * Send a connection request from currentUserId to targetUserId.
 * Adds a "pending" entry to BOTH users' connections arrays.
 */
export const sendConnectionRequest = async (currentUserId, targetUserId) => {
    if (currentUserId === targetUserId) {
        throw new Error("Cannot send connection request to yourself");
    }

    const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId).select("connections fullName"),
        User.findById(targetUserId).select("connections fullName")
    ]);

    if (!currentUser || !targetUser) {
        throw new Error("User not found");
    }

    // Check if a connection already exists between these two users
    const existingConnection = currentUser.connections.find(
        (conn) => conn.userId.toString() === targetUserId
    );

    if (existingConnection) {
        throw new Error(
            `Connection already exists with status: ${existingConnection.status}`
        );
    }

    // Add pending connection to BOTH users
    const connectionData = {
        status: "pending",
        requestedBy: currentUserId,
        createdAt: new Date()
    };

    currentUser.connections.push({
        userId: targetUserId,
        ...connectionData
    });

    targetUser.connections.push({
        userId: currentUserId,
        ...connectionData
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    return { message: "Connection request sent successfully" };
};

/**
 * Respond to a connection request.
 * action: "accept" -> set both sides to "connected"
 * action: "reject" -> remove from both sides
 */
export const respondToConnectionRequest = async (
    currentUserId,
    requesterId,
    action
) => {
    if (!["accept", "reject"].includes(action)) {
        throw new Error("Invalid action. Must be 'accept' or 'reject'");
    }

    const [currentUser, requester] = await Promise.all([
        User.findById(currentUserId).select("connections"),
        User.findById(requesterId).select("connections")
    ]);

    if (!currentUser || !requester) {
        throw new Error("User not found");
    }

    // Verify the request exists and was sent BY the requester (not by currentUser)
    const incomingRequest = currentUser.connections.find(
        (conn) =>
            conn.userId.toString() === requesterId &&
            conn.requestedBy.toString() === requesterId &&
            conn.status === "pending"
    );

    if (!incomingRequest) {
        throw new Error("No pending connection request found from this user");
    }

    if (action === "accept") {
        // Update to connected on both sides
        incomingRequest.status = "connected";

        const outgoingEntry = requester.connections.find(
            (conn) => conn.userId.toString() === currentUserId.toString()
        );

        if (outgoingEntry) {
            outgoingEntry.status = "connected";
        }

        await Promise.all([currentUser.save(), requester.save()]);

        return { message: "Connection accepted", status: "connected" };
    }

    if (action === "reject") {
        // Remove from both sides
        currentUser.connections = currentUser.connections.filter(
            (conn) => conn.userId.toString() !== requesterId
        );

        requester.connections = requester.connections.filter(
            (conn) => conn.userId.toString() !== currentUserId.toString()
        );

        await Promise.all([currentUser.save(), requester.save()]);

        return { message: "Connection request rejected", status: "rejected" };
    }
};
