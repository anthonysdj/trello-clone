package com.trello.dto;

public class CreateCardRequest {
    private String title;
    private String description;
    private Integer position;
    private Long listId;

    public CreateCardRequest() {
    }

    public CreateCardRequest(String title, String description, Integer position, Long listId) {
        this.title = title;
        this.description = description;
        this.position = position;
        this.listId = listId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Long getListId() {
        return listId;
    }

    public void setListId(Long listId) {
        this.listId = listId;
    }
}
