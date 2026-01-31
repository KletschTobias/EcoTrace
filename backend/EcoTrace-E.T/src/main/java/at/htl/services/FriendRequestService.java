package at.htl.services;

import at.htl.dtos.FriendRequestDto;
import at.htl.dtos.UserDto;
import at.htl.entities.FriendRequest;
import at.htl.entities.Friendship;
import at.htl.entities.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class FriendRequestService {

    @Inject
    KeycloakService keycloakService;

    @Inject
    AuthService authService;

    @Transactional
    public FriendRequestDto sendFriendRequest(Long senderId, String receiverIdentifier) {
        io.quarkus.logging.Log.info("Processing friend request from userId: " + senderId + " to identifier: " + receiverIdentifier);
        
        User sender = User.findById(senderId);
        if (sender == null) {
            io.quarkus.logging.Log.error("Sender user not found in database! UserID: " + senderId);
            throw new NotFoundException("Sender not found");
        }

        // Try to find receiver by username, externalId, or email
        User receiver = User.findByUsername(receiverIdentifier);
        if (receiver == null) {
            receiver = User.findByExternalId(receiverIdentifier);
        }
        if (receiver == null) {
            receiver = User.findByEmail(receiverIdentifier);
        }

        // If not found locally, try to find in Keycloak and sync
        if (receiver == null) {
            io.quarkus.logging.Log.info("Receiver not found locally, searching in Keycloak: " + receiverIdentifier);
            Map<String, String> keycloakUser = keycloakService.findUser(receiverIdentifier);
            
            if (keycloakUser != null) {
                String kId = keycloakUser.get("id");
                String kUsername = keycloakUser.get("username");
                String kEmail = keycloakUser.get("email");
                String kFirstName = keycloakUser.get("firstName");
                String kLastName = keycloakUser.get("lastName");
                String kFullName = (kFirstName + " " + kLastName).trim();
                if (kFullName.isEmpty()) kFullName = kUsername;
                
                io.quarkus.logging.Log.info("User found in Keycloak! Syncing to DB: " + kUsername + " (" + kId + ")");
                receiver = authService.createNewUser(kId, kUsername, kFullName, kEmail);
            }
        }

        if (receiver == null) {
            io.quarkus.logging.Log.error("Receiver user not found! Identifier: " + receiverIdentifier);
            throw new NotFoundException("User not found with identifier: " + receiverIdentifier);
        }

        if (sender.id.equals(receiver.id)) {
            throw new BadRequestException("Cannot send friend request to yourself");
        }

        // Check if they are already friends
        Friendship existingFriendship = Friendship.findByUserAndFriend(senderId, receiver.id);
        if (existingFriendship != null && "accepted".equals(existingFriendship.status)) {
            throw new BadRequestException("You are already friends");
        }

        // Check if there's already a pending request
        FriendRequest existing = FriendRequest.findByUsers(senderId, receiver.id);
        if (existing != null && existing.status == FriendRequest.Status.PENDING) {
            throw new BadRequestException("Friend request already exists");
        }

        FriendRequest request = new FriendRequest();
        request.sender = sender;
        request.receiver = receiver;
        request.status = FriendRequest.Status.PENDING;
        request.persist();

        return FriendRequestDto.from(request);
    }

    @Transactional
    public FriendRequestDto acceptFriendRequest(Long requestId, Long userId) {
        FriendRequest request = FriendRequest.findById(requestId);
        if (request == null) {
            throw new NotFoundException("Friend request not found");
        }

        if (!request.receiver.id.equals(userId)) {
            throw new BadRequestException("You can only accept requests sent to you");
        }

        if (request.status != FriendRequest.Status.PENDING) {
            throw new BadRequestException("Request has already been processed");
        }

        request.status = FriendRequest.Status.ACCEPTED;

        // Create bidirectional friendship entries
        Friendship friendship1 = new Friendship();
        friendship1.user = request.sender;
        friendship1.friend = request.receiver;
        friendship1.status = "accepted";
        friendship1.persist();

        Friendship friendship2 = new Friendship();
        friendship2.user = request.receiver;
        friendship2.friend = request.sender;
        friendship2.status = "accepted";
        friendship2.persist();

        return FriendRequestDto.from(request);
    }

    @Transactional
    public FriendRequestDto rejectFriendRequest(Long requestId, Long userId) {
        FriendRequest request = FriendRequest.findById(requestId);
        if (request == null) {
            throw new NotFoundException("Friend request not found");
        }

        if (!request.receiver.id.equals(userId)) {
            throw new BadRequestException("You can only reject requests sent to you");
        }

        if (request.status != FriendRequest.Status.PENDING) {
            throw new BadRequestException("Request has already been processed");
        }

        request.status = FriendRequest.Status.REJECTED;
        return FriendRequestDto.from(request);
    }

    @Transactional
    public void cancelFriendRequest(Long requestId, Long userId) {
        FriendRequest request = FriendRequest.findById(requestId);
        if (request == null) {
            throw new NotFoundException("Friend request not found");
        }

        if (!request.sender.id.equals(userId)) {
            throw new BadRequestException("You can only cancel requests you sent");
        }

        request.delete();
    }

    public List<FriendRequestDto> getPendingReceivedRequests(Long userId) {
        return FriendRequest.<FriendRequest>list("receiver.id = ?1 and status = ?2", 
                userId, FriendRequest.Status.PENDING)
                .stream()
                .map(FriendRequestDto::from)
                .collect(Collectors.toList());
    }

    public List<FriendRequestDto> getPendingSentRequests(Long userId) {
        return FriendRequest.<FriendRequest>list("sender.id = ?1 and status = ?2", 
                userId, FriendRequest.Status.PENDING)
                .stream()
                .map(FriendRequestDto::from)
                .collect(Collectors.toList());
    }
}
