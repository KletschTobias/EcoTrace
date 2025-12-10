package at.htl.services;

import at.htl.dtos.FriendshipDto;
import at.htl.dtos.UserDto;
import at.htl.entities.Friendship;
import at.htl.entities.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class FriendshipService {

    public List<UserDto> getUserFriends(Long userId) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        List<Friendship> friendships = Friendship.list("(user.id = ?1 or friend.id = ?1) and status = 'accepted'", userId);
        
        List<UserDto> friends = new ArrayList<>();
        for (Friendship friendship : friendships) {
            if (friendship.user.id.equals(userId)) {
                friends.add(UserDto.from(friendship.friend));
            } else {
                friends.add(UserDto.from(friendship.user));
            }
        }
        
        return friends;
    }

    public List<FriendshipDto> getUserFriendships(Long userId) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        return Friendship.<Friendship>list("user.id = ?1 or friend.id = ?1", userId).stream()
                .map(FriendshipDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public FriendshipDto addFriend(Long userId, String friendExternalId) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        User friend = User.findByExternalId(friendExternalId);
        if (friend == null) {
            throw new NotFoundException("Friend not found with externalId: " + friendExternalId);
        }

        if (user.id.equals(friend.id)) {
            throw new BadRequestException("Cannot add yourself as a friend");
        }

        // Check if friendship already exists
        Friendship existing = Friendship.findByUserAndFriend(userId, friend.id);
        if (existing != null) {
            throw new BadRequestException("Friendship already exists");
        }

        Friendship friendship = new Friendship();
        friendship.user = user;
        friendship.friend = friend;
        friendship.status = "accepted";
        friendship.persist();

        return FriendshipDto.from(friendship);
    }

    @Transactional
    public void removeFriend(Long userId, Long friendshipId) {
        Friendship friendship = Friendship.findById(friendshipId);
        if (friendship == null) {
            throw new NotFoundException("Friendship not found");
        }

        if (!friendship.user.id.equals(userId) && !friendship.friend.id.equals(userId)) {
            throw new NotFoundException("Friendship does not belong to this user");
        }

        friendship.delete();
    }

    public List<UserDto> getLeaderboard(Long userId) {
        List<User> allUsers = User.listAll();
        return allUsers.stream()
                .sorted((a, b) -> Double.compare(a.totalCo2, b.totalCo2))
                .map(UserDto::from)
                .collect(Collectors.toList());
    }
}
